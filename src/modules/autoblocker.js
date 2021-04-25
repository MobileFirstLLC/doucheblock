import {alertCap, browserVariant, classFlag} from '../config'
import Storage from "./storage";
import TwitterApi from "./twitterApi";
import bs from "./blockerState"; // most definitely


/**
 * @description
 * AutoBlocker is a content script responsible for discovering Twitter handles
 * and checking them for banned keywords. It works as follows:
 *
 * It runs in the browser tab context and watches DOM changes. It then attempts
 * to find twitter handles in the DOM tree when the tree changes.
 *
 * After finding handles those handles are first placed in a temporary queue
 * to limit API calls. Once the queue is "full enough" and API credentials are
 * available, the discovered handles will be checked.
 *
 * First it will request the bio for each handle and then check that bio for
 * prohibited keywords. If keyword is detected, either prompt user to confirm
 * the blocking (user preference) or automatically block. Manually choosing
 * not to block will add the handle to a whitelist.
 *
 * Notes:
 * - The queue stage is used to limit number of API calls, and is necessary
 * to avoid exceeding Twitter rate limit
 * - Handle is only checked once per session; checked handled are kept in memory
 * and will not be checked again until full page reload occurs.
 *
 * @module
 * @name AutoBlocker
 */
export default class AutoBlocker {

    /**
     * @ignore
     */
    constructor() {
        // Load user preferences then start DOM tree mutation observer
        AutoBlocker.loadSettings(AutoBlocker.startWatch);
        // Activate listener for user preferences changes;
        // background will broadcast if changes occur and
        // content script needs to reload user preferences.
        AutoBlocker.registerListener();
    }

    /**
     * Add message listener to know when to reload settings.
     */
    static registerListener() {
        window.chrome.runtime.onMessage.addListener(
            (request) => {
                if (request.updateSettings) {
                    AutoBlocker.loadSettings();
                    return true;
                }
            });
    }

    /**
     * Load user settings from storage.
     * @param {function?} callback
     */
    static loadSettings(callback) {
        Storage.getSettings(settings => {
            bs.keyList = settings[Storage.keys.blockWords]
            bs.confirmBlocks = settings[Storage.keys.confirm];
            bs.whiteList.whiteList = settings[Storage.keys.whiteList];
            if (callback) callback();
        });
    }

    /**
     * Request the tokens from background context.
     * @param {function?} callback - will call if ready to proceed
     */
    static obtainTokens(callback) {
        browserVariant().runtime.sendMessage({tokens: true},
            ({bearer, csrf}) => {
                bs.tokens = {
                    bearerToken: bearer,
                    csrfToken: csrf
                }
                if (bs.ready && callback) callback();
            });
    }

    /**
     * Watch DOM tree changes
     */
    static startWatch() {
        const obs = new MutationObserver(AutoBlocker.onDomChange);
        obs.observe(document.body, {subtree: true, childList: true});
        AutoBlocker.lookForDouches();
    }

    /**
     * Handle DOM tree changes
     * @param mutationsList
     */
    static onDomChange(mutationsList) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                AutoBlocker.lookForDouches();
            }
        }
    }

    /**
     * Start douchy user lookup flow.
     */
    static lookForDouches() {
        // Before lookup ensure we have necessary tokens to get bios
        if (!bs.ready) {
            AutoBlocker.obtainTokens(AutoBlocker.findHandles);
        } else {
            // next look for handles on the page
            AutoBlocker.findHandles();
        }
    }

    /**
     * Look for handles in the timeline
     */
    static findHandles() {
        const links = document.getElementsByTagName('a');

        for (let n = 0; n < links.length; n++) {
            AutoBlocker.checkLink(links[n]);
        }

        AutoBlocker.shouldCheckBios();
    }

    /**
     * Conditionally queue a handle
     * @param {Element} link
     */
    static checkLink(link) {
        // some conditional checks on the link
        // for example should be a link to a handle
        if (AutoBlocker.isHandleLink(link)) {

            // mark link as checked to prevent re-checking
            link.classList.add(classFlag);
            // extract handle string
            const handle = AutoBlocker.parseHandle(link);

            // check that handle has not already been processed
            if (!bs.handledList.isChecked(handle) &&
                !bs.pendingQueue.inQueue(handle)) {
                bs.pendingQueue.add(handle);
            }
        }
    }

    /**
     * Determine if some link element is a handle, potentially.
     * @param {Element} link DOM element
     * @returns {boolean}
     */
    static isHandleLink(link) {
        return !!(
            // must contain text
            link.innerText &&
            // has role = "link" attribute
            link.getAttribute('role') === 'link' &&
            // not marked as previously checked
            !link.classList.contains(classFlag) &&
            // contains "@" of handle
            link.innerText.indexOf('@') >= 0)
    }

    /**
     * Extract handle string from a DOM node
     * @param {Element} link
     * @returns {string}
     */
    static parseHandle(link) {
        const substr = link.innerText.substr(
            link.innerText.indexOf('@') + 1);
        const [handle] = (substr.split(/\s+/, 1));
        return handle;
    }

    /**
     * After enough names are in queue, get the bios from API
     */
    static shouldCheckBios() {
        const shouldRequest =
            // queue is non-empty *AND*
            !bs.pendingQueue.isEmpty &&
            // EITHER: first request *or* been long enough
            (!bs.lastBioTimestamp || bs.lastBioIntervalExpired());

        if (!shouldRequest) return;

        // update timestamp and get handles from queue
        bs.lastBioTimestamp = Date.now()
        const queue = bs.pendingQueue.takeNext()

        // request bios for list of handles
        TwitterApi.getTheBio(queue,
            bs.tokens.bearerToken,
            bs.tokens.csrfToken,
            (bios) => {
                // when bios returned, process them
                bs.handledList.add(queue);
                AutoBlocker.processBios(bios);
            },
            () => {
                // put names back on the queue
                bs.pendingQueue.addAll(queue)
            });
    }

    /**
     * Check a list of bios to find bios matching
     * blocking criteria
     * @param {Object[]} bios
     */
    static processBios(bios) {
        if (!bios || !bios.length) return;
        const blockableBios = bios.filter(AutoBlocker.isBlockMatch);
        const limitList = AutoBlocker.limitAlertCount(blockableBios);
        AutoBlocker.sequentiallyBlock(limitList);
    }

    /**
     * Check if bio should block
     * @param {Object} user
     * @returns {boolean}
     */
    static isBlockMatch(user) {
        const {bio, id} = user;
        return id && bio &&
            !bs.whiteList.contains(id) &&
            bs.keyList.filter(w => bio.toLowerCase()
                .indexOf(w) >= 0)
                .length > 0;
    }

    /**
     * Limit the number of bio matches to limit how many
     * alerts are shown in sequence. If input exceed limit,
     * input will be resized with excess re-queued. The method
     * will return at most max allowed matches.
     *
     * @param {Object[]} bios
     * @returns {Object[]} bios
     */
    static limitAlertCount(bios) {
        // if user doesn't see confirmation alerts
        // 0 alerts will show -> return all handles
        if (!bios || !bs.confirmBlocks || bios.length <= alertCap) {
            return bios;
        }
        const keep = bios.slice(0, alertCap)
        const excessHandles = bios.slice(alertCap)
            .map(({handle}) => handle);
        bs.handledList.remove(excessHandles);
        bs.pendingQueue.addAll(excessHandles);
        return keep;
    }

    /**
     * Check a list of bios for blocking
     * @param {Object[]} bios
     */
    static sequentiallyBlock(bios) {
        if (bios && bios.length) {
            const first = bios.shift();
            AutoBlocker.executeBlock(first)
                .then(_ => AutoBlocker.sequentiallyBlock(bios))
                .catch();
        }
    }

    /**
     * Construct window alert
     * @param {string} bio
     * @param {string} name
     * @returns {string}
     */
    static buildAlert(bio, name) {
        const sanitizedBio = `${name} : ${(bio || '')
            .replace(/\s\s+/g, ' ')}`;
        const alert = browserVariant().i18n.getMessage('doucheAlert');
        const confirm = browserVariant().i18n.getMessage('proceedToBlock', name);
        return `${alert}` +
            '\n==================================' +
            `\n${sanitizedBio}` +
            '\n==================================' +
            `\n\n${confirm}`;
    }

    /**
     * Check the bio for flagged words
     * @param {string} bio - bio text
     * @param {string} id - twitter id
     * @param {string} handle - user handle
     * @param {string} name - user name
     * @returns {Promise}
     */
    static executeBlock({bio, id, handle, name}) {
        return new Promise((resolve) => {
            // user picked cancel -> whitelist this handle
            if (bs.confirmBlocks &&
                !window.confirm(AutoBlocker.buildAlert(bio, name))) {
                bs.whiteList.add(id, handle);
            }
            // auto-block or user clicked OK to block
            else {
                TwitterApi.doTheBlock(id,
                    bs.tokens.bearerToken,
                    bs.tokens.csrfToken);
            }
            // add some latency
            return window.setTimeout(resolve, 500);
        })
    }
}
