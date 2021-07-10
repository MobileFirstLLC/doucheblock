import Storage from './storage';
import {requestConfigs} from '../config';

/**
 * @description
 * Queue contains discovered handles for which
 * bios have not yet been requested.
 *
 * @name PendingQueue
 */
class PendingQueue {

    /**
     * Get the pending queue
     * @returns {string[]}
     */
    static get queue() {
        return this._pendingQueue || [];
    }

    /**
     * Determine if queue is empty
     * @returns {boolean}
     */
    static get isEmpty() {
        return PendingQueue.queue.length === 0;
    }

    /**
     * Add a handle to pending queue
     * @param {string} value
     */
    static add(value) {
        this._pendingQueue = (PendingQueue.queue).concat([value]);
    }

    /**
     * Batch insert into queue
     * @param {string[]} values
     */
    static addAll(values) {
        this._pendingQueue = (PendingQueue.queue).concat(values);
    }

    /**
     * Whether given handle is currently in queue
     * @param {string} handle
     * @returns {boolean} - true for "yes, it is in queue"
     */
    static inQueue(handle) {
        return PendingQueue.queue.indexOf(handle) >= 0;
    }

    /**
     * Take allowed max number of names from the queue
     * @returns {string[]}
     */
    static takeNext() {
        const N = Math.min(PendingQueue.queue.length,
            requestConfigs.maxLookupCount);
        return PendingQueue.queue.splice(0, N);
    }

    /* @private */
    static clear() {
        this._pendingQueue = [];
    }
}

/**
 * List of handles that have been checked during
 * ongoing session and will not be rechecked.
 *
 * @name HandledList
 */
class HandledList {

    /**
     * Get the handles checklist
     * @returns {string[]}
     */
    static get list() {
        return this._handleCheckList || [];
    }

    /**
     * Add (multiple) handles to list of "already
     * processed". Once here that handle will not
     * be checked again.
     * @param values - array of handles
     */
    static add(values) {
        this._handleCheckList = (HandledList.list).concat(values);
    }

    /**
     * Remove (multiple) handles from list of "already
     * processed".
     * @param {string[]} values - array of handles
     */
    static remove(values) {
        this._handleCheckList = HandledList.list
            .filter(value => values.indexOf(value) < 0);
    }

    /**
     * Determine if handle has already been checked
     * for "compliance"
     * @param {string} handle
     * @returns {boolean} - true if already checked
     */
    static isChecked(handle) {
        return HandledList.list.indexOf(handle) >= 0;
    }

    /* @private */
    static clear() {
        this._handleCheckList = [];
    }
}

/**
 * Whitelisted handles contain blocked words but
 * user has manually selected to not block them.
 *
 * @name WhiteList
 */
class WhiteList {

    /**
     * Get the list of whitelisted handles
     * @returns {Object<string,string>}
     */
    static get whiteList() {
        return this._whiteList || {};
    }

    static set whiteList(value) {
        this._whiteList = value;
    }

    /**
     * Update client whitelist
     * @param {string} id
     * @param {string} handle
     */
    static add(id, handle) {
        Storage.addWhiteList({[id]: handle}, newList => {
            WhiteList.whiteList = newList;
        });
    }

    /**
     * Check if user id is whitelisted
     * @param {string} id
     * @returns {boolean}
     */
    static contains(id) {
        return !!WhiteList.whiteList[id];
    }
}

/**
 * @description
 * Manage blocker state
 *
 * @module
 * @name BlockerState
 */
export default class BlockerState {

    /**
     * Get list of handles that have already been checked
     * during this session, meaning bio was requested and
     * checked for blocking.
     *
     * @returns {HandledList}
     */
    static get handledList() {
        return HandledList;
    }

    /**
     * Get the queue that holds discovered handles waiting
     * to be processed. When handle is in queue, the handle
     * has been found, but bio has not been checked yet.
     *
     * @returns {PendingQueue}
     */
    static get pendingQueue() {
        return PendingQueue;
    }

    /**
     * Get the list of whitelisted handles. Whitelisted handles
     * may contain block words, but user has explicitly bypassed
     * the block on this user.
     *
     * @returns {WhiteList}
     */
    static get whiteList() {
        return WhiteList;
    }

    /**
     * Get/set the timestamp of last API bio request.
     *
     * @returns {number|undefined} - if undefined,
     * request had never been made
     */
    static get lastBioTimestamp() {
        return this._bioRequest;
    }

    static set lastBioTimestamp(value) {
        this._bioRequest = value;
    }

    /**
     * Whether it has been "long enough" since last bio request.
     *
     * @readonly
     * @returns {boolean} - true when it has been long enough.
     */
    static get lastBioExpired() {
        const diff = Date.now() - BlockerState.lastBioTimestamp;
        return Math.abs(diff) > requestConfigs.maxInterval;
    }

    /**
     * Get/set API tokens
     * @returns {Object}
     */
    static get tokens() {
        return this._tokens;
    }

    static set tokens(value) {
        this._tokens = value;
    }

    /**
     * Check if module is ready to make API
     * calls; it needs API tokens from background
     * first and this is an async process. Ignoring
     * this check means API call will fail if not
     * ready yet.
     *
     * @readonly
     * @returns {boolean} - true when ready to call API
     */
    static get ready() {
        return !!(BlockerState.tokens &&
            BlockerState.tokens.csrfToken &&
            BlockerState.tokens.bearerToken);
    }

    /**
     * Get/set the list of flagged words that lead to blocking
     * @returns {string[]}
     */
    static get keyList() {
        return this._keyList;
    }

    static set keyList(value) {
        this._keyList = value;
    }

    /**
     * Get/set confirmation setting
     * @returns {Boolean}
     */
    static get confirmBlocks() {
        return this._confirm;
    }

    static set confirmBlocks(value) {
        this._confirm = value;
    }
}

