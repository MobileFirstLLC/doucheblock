import Storage from "./storage";
import {requestConfigs} from "../config";

/**
 * @ignore
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
            requestConfigs.maxLookupCount)
        return [...PendingQueue.queue.splice(0, N)];
    }
}

/**
 * @ignore
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
     * Determine if handle has already been checked
     * for "compliance"
     * @param {string} handle
     * @returns {boolean} - true if already checked
     */
    static isChecked(handle) {
        return HandledList.list.indexOf(handle) >= 0;
    }
}

/**
 * @ignore
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
            WhiteList.whiteList = newList
        })
    }

    /**
     * Check if user id is whitelisted
     * @param {string} id
     * @returns {boolean}
     */
    static contains(id) {
        return !!WhiteList.whiteList[id]
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
     * Get the handles checklist
     * @returns {string[]}
     */
    static get handledList() {
        return HandledList
    }

    /**
     * Get the pending queue
     * @returns {Object}
     */
    static get pendingQueue() {
        return PendingQueue;
    }

    /**
     * Get the list of whitelisted handles
     * @returns {Object<string,string>}
     */
    static get whiteList() {
        return WhiteList;
    }

    /**
     * Get the timestamp of last API bio request
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
     * It has been "long enough" since last buio request
     * @returns {boolean}
     */
    static lastBioIntervalExpired() {
        return Math.abs(Date.now() - BlockerState.lastBioTimestamp)
            > requestConfigs.maxInterval;
    }

    /**
     * API tokens
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
     * @returns {boolean} - true when ready to call API
     */
    static get ready() {
        return !!(BlockerState.tokens &&
            BlockerState.tokens.csrfToken &&
            BlockerState.tokens.bearerToken)
    }

    /**
     * Get the list of flagged words that lead to blocking
     * @returns {string[]}
     */
    static get keyList() {
        return this._keyList;
    }

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

    static set confirmBlocks(value) {
        this._confirm = value;
    }
}

