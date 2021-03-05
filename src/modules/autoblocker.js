import Storage from "./storage";
import TwitterApi from "./twitterApi";
import {requestConfigs, browserVariant} from '../config'

// noinspection JSUnresolvedVariable,JSDeprecatedSymbols,JSUnresolvedFunction
/**
 * @description
 * AutoBlocker module runs in the browser tab context and watches DOM changes.
 * It then attempts to find twitter handles in the DOM tree. After finding handles
 * those handles are first placed in a temporary queue to limit API calls; once
 * the queue is "full enough" and API credentials are available, AutoBlocker module
 * will proceed to process the discovered handles by first requesting the bio for
 * each handle and then checking that bio for prohibited keywords. If keyword
 * is detected AutoBlocker will either prompt user to confirm the blocking
 * (user preference) or automatically block, which completes the work done by this
 * module.
 *
 * Notes:
 * - The queue stage is used to limit number of API calls, failure to do so will
 * result in 429.
 * - Handle is only checked once per session; checked handled are kept in memory
 * and will not be checked again until full page reload occurs
 *
 * @module
 * @name AutoBlocker
 */
export default class AutoBlocker {

    /**
     * @ignore
     */
    constructor() {
        // initially this list is empty to say
        // no handles have been checked yet
        AutoBlocker.handleCheckList = [];
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
     * Flag checked DOM elements with this class;
     * it can be anything, but you'd want it to be
     * sufficiently unique so it doesn't clash with
     * actual class names by accident
     * @returns {string} - special class name used by
     * this extension
     */
    static get classFlag() {
        return 'dbt___seen-it-b4';
    }

    /**
     * Check if module is ready to make API
     * calls; it needs API tokens from background
     * first and this is an async process. Ignoring
     * this check means API call will fail if not
     * ready yet.
     *
     * @returns {boolean} - true when ready to call API
     */
    static get ready() {
        return !!(AutoBlocker.csrfToken && AutoBlocker.bearerToken)
    }

    /**
     * Get the timestamp of last API bio request
     * @returns {number|undefined} - if undefined,
     * request had never been made
     */
    static get lastBioTimestamp() {
        return this._bioRequest;
    }

    /**
     * Update the timestamp when last bio
     * API request was made
     * @param {number} value - UTC milliseconds
     */
    static set lastBioTimestamp(value) {
        this._bioRequest = value;
    }

    /**
     * Get bearer token
     * @returns {string}
     */
    static get bearerToken() {
        return this._token;
    }

    /**
     * Set bearer token
     * @param {string} value
     */
    static set bearerToken(value) {
        this._token = value;
    }

    /**
     * Get CSRF token
     * @returns {string}
     */
    static get csrfToken() {
        return this._csrf;
    }

    /**
     * set CSRF token
     * @param {string} value
     */
    static set csrfToken(value) {
        this._csrf = value;
    }

    /**
     * Get the list of flagged words that lead to blocking
     * @returns {string[]}
     */
    static get keyList() {
        return this._keyList;
    }

    /**
     * Setter for list of flagged words
     * @param {string[]} value
     */
    static set keyList(value) {
        this._keyList = value;
    }

    /**
     * Get confirmation setting
     * @returns {Boolean}
     */
    static get confirmBlocks() {
        return this._confirm;
    }

    /**
     * Setter for confirming blocks manually
     * @param {Boolean} value
     */
    static set confirmBlocks(value) {
        this._confirm = value;
    }

    /**
     * Get the handles checklist
     * @returns {string[]}
     */
    static get handleCheckList() {
        return this._handleCheckList || [];
    }

    /**
     * Set/reset handles list
     * @param value - new list value
     */
    static set handleCheckList(value) {
        this._handleCheckList = value;
    }

    /**
     * Determine if handle has already been checked
     * for "compliance"
     * @param {string} handle
     * @returns {boolean} - true if already checked
     */
    static alreadyChecked(handle) {
        return AutoBlocker
            .handleCheckList
            .indexOf(handle) >= 0;
    }

    /**
     * Add (multiple) handles to list of "already
     * processed". Once here that handle will not
     * be checked again.
     * @param values - array of handles
     */
    static addToHandledList(values) {
        this._handleCheckList = (this._handleCheckList).concat(values);
    }

    /**
     * Get the pending queue
     * @returns {string[]}
     */
    static get pendingQueue() {
        return this._pendingQueue || [];
    }

    /**
     * Empty the queue
     */
    static resetQueue() {
        this._pendingQueue = [];
    }

    /**
     * Add a handle to pending queue
     * @param {string} value
     */
    static addToQueue(value) {
        this._pendingQueue = (AutoBlocker.pendingQueue).concat([value]);
    }

    /**
     * Whether given handle is currently in queue
     * @param {string} handle
     * @returns {boolean} - true for "yes, it is in queue"
     */
    static currentlyInQueue(handle) {
        return AutoBlocker.pendingQueue.indexOf(handle) >= 0;
    }

    /**
     * Listen to incoming extension messages
     * to know when to reload settings
     */
    static registerListener() {
        browserVariant().runtime.onMessage.addListener(
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
            AutoBlocker.keyList = settings[Storage.keys.blockWords]
            AutoBlocker.confirmBlocks = settings[Storage.keys.confirm];
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
                AutoBlocker.bearerToken = bearer;
                AutoBlocker.csrfToken = csrf;
                if (AutoBlocker.ready && callback) {
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
        if (!AutoBlocker.ready) {
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
                !link.classList.contains(AutoBlocker.classFlag) &&
                link.innerText.indexOf('@') >= 0) {

                // found a handle
                // first disable rechecking same handle DOM element
                link.classList.add(AutoBlocker.classFlag);

                // extract the exact handle
                const substr = link.innerText.substr(
                    link.innerText.indexOf('@') + 1);
                const [handle] = (substr.split(/\s+/, 1));

                // if this handle has already been seen, stop
                if (!AutoBlocker.alreadyChecked(handle) &&
                    !AutoBlocker.currentlyInQueue(handle)) {
                    AutoBlocker.addToQueue(handle);
                    if (AutoBlocker.pendingQueue.length >
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
            AutoBlocker.pendingQueue.length > 0 && (
                // EITHER: no previous request and at
                // least some pending handles
            (!AutoBlocker.lastBioTimestamp &&
                AutoBlocker.pendingQueue.length > 3) ||
            // - OR - it has been long enough since last request
            (Math.abs(Date.now() - AutoBlocker.lastBioTimestamp) >
                requestConfigs.maxInterval));

        if (shouldRequest) {
            AutoBlocker.lastBioTimestamp = Date.now()
            const queue = [...AutoBlocker.pendingQueue];
            AutoBlocker.resetQueue();
            AutoBlocker.addToHandledList(queue)
            TwitterApi.getTheBio(queue,
                AutoBlocker.bearerToken,
                AutoBlocker.csrfToken,
                AutoBlocker.shouldBlock);
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
    static shouldBlock(handle, bio, id, name) {
        if (!id || !bio) return;
        const lowercaseBio = bio.toLowerCase();
        const keywordMatch = AutoBlocker.keyList
            .filter(w => lowercaseBio.indexOf(w) >= 0)
            .length;
        if (keywordMatch) {
            if (!AutoBlocker.confirmBlocks ||
                window.confirm(AutoBlocker.buildAlert(bio, name))) {
                TwitterApi.doTheBlock(id,
                    AutoBlocker.bearerToken,
                    AutoBlocker.csrfToken);
            }
        }
    }
}
