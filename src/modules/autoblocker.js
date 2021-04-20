import {requestConfigs, browserVariant, classFlag} from '../config'
import Storage from "./storage";
import TwitterApi from "./twitterApi";
import BlockerState from "./blockerState";

// noinspection JSUnresolvedVariable,JSDeprecatedSymbols,JSUnresolvedFunction
/**
 * @description
 * BlockerState is a content script responsible for discovering Twitter handles
 * and checking them for banned keywords. It works as follows:
 *
 * It runs in the browser tab context and watches DOM changes. It then attempts
 * to find twitter handles in the DOM tree when the tree changes.
 *
 * After finding handles those handles are first placed in a temporary queue
 * to limit API calls. Once the queue is "full enough" and API credentials a
 * re available, BlockerState module will proceed to process the discovered
 * handles.
 *
 * First it will request the bio for each handle and then checking that bio
 * for prohibited keywords. If keyword is detected BlockerState will either
 * prompt user to confirm the blocking (user preference) or automatically block,
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
        BlockerState.init()
        // Load user preferences then start the
        // DOM tree mutation observer
        AutoBlocker.loadSettings(AutoBlocker.startWatch);
        // Activate listener for user preferences changes;
        // background will broadcast these if changes occur
        // at which point (all) content script needs to
        // reload user preferences.
        AutoBlocker.registerListener();
    }

    /**
     * Listen to incoming extension messages
     * to know when to reload settings
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
     * Load user settings from storage;
     * these stay in memory until time to reload
     * @param {function?} callback
     */
    static loadSettings(callback) {
        Storage.getSettings(settings => {
            BlockerState.keyList = settings[Storage.keys.blockWords]
            BlockerState.confirmBlocks = settings[Storage.keys.confirm];
            BlockerState.whiteList = settings[Storage.keys.whiteList];
            if (callback) callback();
        });
    }

    /**
     * Request the tokens
     * @param callback - will call if ready to proceed
     */
    static obtainTokens(callback) {
        browserVariant().runtime.sendMessage(
            {tokens: true}, ({bearer, csrf}) => {
                BlockerState.bearerToken = bearer;
                BlockerState.csrfToken = csrf;
                if (BlockerState.ready && callback) {
                    callback();
                }
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
     * Respond to DOM tree changes
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
        if (!BlockerState.ready) {
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
            const link = links[n];

            // some conditional checks on the link
            // for example should be a link to a handle
            if (link.innerText &&
                link.getAttribute('role') === 'link' &&
                !link.classList.contains(classFlag) &&
                link.innerText.indexOf('@') >= 0) {

                // found a handle
                // first disable rechecking same handle DOM element
                link.classList.add(classFlag);

                // extract the exact handle
                const substr = link.innerText.substr(
                    link.innerText.indexOf('@') + 1);
                const [handle] = (substr.split(/\s+/, 1));

                // if this handle has already been seen, stop
                if (!BlockerState.alreadyChecked(handle) &&
                    !BlockerState.currentlyInQueue(handle)) {
                    BlockerState.addToQueue(handle);
                    if (BlockerState.pendingQueue.length >=
                        requestConfigs.maxLookupCount) {
                        break;
                    }
                }
            }
        }

        AutoBlocker.shouldCheckBios();
    }

    /**
     * After enough names actually get the bios
     */
    static shouldCheckBios() {
        const shouldRequest =
            // queue cannot be empty AND
            BlockerState.pendingQueue.length > 0 &&
            // EITHER: no previous request and at
            // least some pending handles
            ((!BlockerState.lastBioTimestamp &&
                BlockerState.pendingQueue.length > 0) ||
                // - OR - it has been long enough since last request
                (Math.abs(Date.now() - BlockerState.lastBioTimestamp) >
                    requestConfigs.maxInterval));

        if (shouldRequest) {
            BlockerState.lastBioTimestamp = Date.now()
            // take max names from the queue
            const N = Math.min(BlockerState.pendingQueue.length,
                requestConfigs.maxLookupCount)
            const queue = [...BlockerState.pendingQueue.splice(0, N)];
            TwitterApi.getTheBio(queue,
                BlockerState.bearerToken,
                BlockerState.csrfToken,
                (bios) => {
                    BlockerState.addToHandledList(queue);
                    AutoBlocker.processBios(bios);
                },
                () => {
                    queue.map(name => BlockerState.addToQueue(name))
                });
        }
    }

    /**
     * Check a list of bios for blocking
     * @param {Object[]} bios
     */
    static processBios(bios) {
        if (bios && bios.length) {
            const first = bios.shift();
            AutoBlocker.shouldBlock(first)
                .then(_ => AutoBlocker.processBios(bios))
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
     */
    static shouldBlock({bio, id, handle, name}) {
        return new Promise((resolve) => {
            if (!id || !bio || BlockerState.whiteList[id]) {
                return resolve();
            }

            const lowercaseBio = bio.toLowerCase();
            const keywordMatch = BlockerState.keyList
                .filter(w => lowercaseBio.indexOf(w) >= 0)
                .length;

            if (!keywordMatch) {
                return resolve();
            }

            // user picked cancel -> whitelist this handle
            if (BlockerState.confirmBlocks &&
                !window.confirm(AutoBlocker.buildAlert(bio, name))) {
                BlockerState.addToWhiteList(id, handle);
            }
            // auto-block or use clicked OK to block
            else {
                TwitterApi.doTheBlock(id,
                    BlockerState.bearerToken,
                    BlockerState.csrfToken);
            }
            return window.setTimeout(resolve, 500);
        })
    }
}
