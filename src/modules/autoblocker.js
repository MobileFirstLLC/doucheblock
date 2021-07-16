import {alertCap, browserVariant, classFlag, isFirefox} from '../config';
import Storage from './storage';
import TwitterApi from './twitterApi';
import bs from './blockerState'; // most definitely

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
        if (isFirefox) {
            browser.runtime.onMessage.addListener(request => {
                if (request.updateSettings) {
                    AutoBlocker.loadSettings();
                }
            });
            return Promise.resolve();
        } else {
            window.chrome.runtime.onMessage.addListener(
                (request) => {
                    if (request.updateSettings) {
                        AutoBlocker.loadSettings();
                        return true;
                    }
                });
        }
    }

    /**
     * Load user settings from storage.
     * @param {function?} callback
     */
    static loadSettings(callback) {
        Storage.getSettings(settings => {
            bs.keyList = settings[Storage.keys.blockWords];
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
                };
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
            AutoBlocker.processLinks(links[n]);
        }

        AutoBlocker.requestBios();
    }

    /**
     * Check DOM links and queue newly discovered handles.
     *
     * @param {Element} link DOM node
     */
    static processLinks(link) {
        // first check that the element is a link to a user
        if (AutoBlocker.isHandleLink(link)) {

            // mark link as checked to prevent re-checking
            link.classList.add(classFlag);

            // extract handle
            const handle = AutoBlocker.parseHandle(link);

            // check that handle has not already been processed
            if (!bs.handledList.isChecked(handle) &&
                !bs.pendingQueue.inQueue(handle)) {
                bs.pendingQueue.add(handle);
            }
        }
    }

    /**
     * Determine if some link element is a handle.
     *
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
            link.innerText.indexOf('@') >= 0);
    }

    /**
     * Extract handle string from a DOM element.
     *
     * @param {Element} link element
     * @returns {string} twitter user handle
     */
    static parseHandle(link) {
        const substr = link.innerText.substr(
            link.innerText.indexOf('@') + 1);
        const [handle] = (substr.split(/\s+/, 1));
        return handle;
    }

    /**
     * If there are enough names are in queue, request bios from API.
     */
    static requestBios() {
        const shouldRequest =
            // queue is non-empty *AND*
            !bs.pendingQueue.isEmpty &&
            // EITHER: first request *or* been long enough
            (!bs.lastBioTimestamp || bs.lastBioExpired);

        if (!shouldRequest) return;

        // update timestamp and get handles from queue
        bs.lastBioTimestamp = Date.now();
        const handles = bs.pendingQueue.takeNext();

        // request bios for list of handles
        TwitterApi.getTheBio(handles,
            bs.tokens.bearerToken,
            bs.tokens.csrfToken,
            (userData) => {
                // mark handles as checked
                bs.handledList.add(handles);
                AutoBlocker.processBios(userData);
            },
            () => {
                // put names back in the queue
                bs.pendingQueue.addAll(handles);
            });
    }

    /**
     * Check users to find bios matching blocking criteria.
     *
     * @param {Object[]} users
     */
    static processBios(users) {
        if (!users || !users.length) return;
        // all users that match block criteria
        const blockable = users.filter(AutoBlocker.isBlockMatch);
        // remaining users after applying max cap
        const limited = AutoBlocker.limitAlertCount(blockable);
        // proceed to block
        AutoBlocker.sequentiallyBlock(limited);
    }

    /**
     * Check if user should be blocked
     *
     * @param {Object} user
     * @returns {boolean}
     */
    static isBlockMatch(user) {
        const {bio, id} = user;
        return id && bio &&
            !bs.whiteList.contains(id) &&
            AutoBlocker.checkWords(bs.keyList, bio);
    }

    /**
     * Match bio against keywords
     * @param {String[]} words - keywords to check
     * @param {String} bio - twitter bio
     * @returns {boolean} true if a douche
     */
    static checkWords(words, bio) {
        for (let i = 0; i < words.length; i++) {
            if (new RegExp(words[i], 'gmi').test(bio)) {
                return true;
            }
        }
        return false;
    }

    /**
     * This method ensures te number of alerts shown to user
     * does not exceed a configurable upper limit. If input
     * exceeds the limit, excess items will be re-queued.
     * Method will return at most max allowed matches.
     *
     * @param {Object[]} users
     * @returns {Object[]} limited count of users
     */
    static limitAlertCount(users) {
        // if user has disabled confirmation alerts they will see
        // 0 alerts -> return all handles
        if (!bs.confirmBlocks || !users || users.length <= alertCap) {
            return users;
        }

        // take max items from the beginning
        const keep = users.slice(0, alertCap);

        // get the excess handles and requeue
        const excessHandles = users.slice(alertCap)
            .map(({handle}) => handle);

        bs.handledList.remove(excessHandles);
        bs.pendingQueue.addAll(excessHandles);
        return keep;
    }

    /**
     * Recursively block a list of users
     *
     * @param {Object[]} users
     */
    static sequentiallyBlock(users) {
        if (users && users.length) {
            const first = users.shift();
            // filter out users that are already blocked
            TwitterApi.isBlocking(first.handle, bs.tokens.bearerToken,
                bs.tokens.csrfToken, isBlocking => {
                    if (isBlocking) {
                        AutoBlocker.sequentiallyBlock(users);
                    } else {
                        AutoBlocker.executeBlock(first)
                            .then(_ => AutoBlocker.sequentiallyBlock(users))
                            .catch();
                    }
                });
        }
    }

    /**
     * Construct a window alert
     *
     * @param {string} bio - user's bio text
     * @param {string} name - user's display name
     * @returns {string} alert text
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
     * Block a user
     *
     * @param {string} bio - user's bio text
     * @param {string} id - user's twitter id
     * @param {string} handle - handle
     * @param {string} name - display name
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
        });
    }
}
