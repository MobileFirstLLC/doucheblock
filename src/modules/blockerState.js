import Storage from "./storage";
import {requestConfigs} from "../config";

/**
 * @description
 * Manage blocker state
 *
 * @module
 * @name BlockerState
 */
export default class BlockerState {

    /**
     * Initial state
     */
    static init() {
        BlockerState.handleCheckList = [];
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
    static addToWhiteList(id, handle) {
        Storage.addWhiteList({[id]: handle}, newList => {
            BlockerState.whiteList = newList
        })
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

    /**
     * Get the handles checklist
     * @returns {string[]}
     */
    static get handleCheckList() {
        return this._handleCheckList || [];
    }

    static set handleCheckList(value) {
        this._handleCheckList = value;
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
     * Determine if handle has already been checked
     * for "compliance"
     * @param {string} handle
     * @returns {boolean} - true if already checked
     */
    static alreadyChecked(handle) {
        return BlockerState.handleCheckList.indexOf(handle) >= 0;
    }

    /**
     * Get the pending queue
     * @returns {string[]}
     */
    static get pendingQueue() {
        return this._pendingQueue || [];
    }

    /**
     * Add a handle to pending queue
     * @param {string} value
     */
    static addToQueue(value) {
        this._pendingQueue = (BlockerState.pendingQueue).concat([value]);
    }

    /**
     * Whether given handle is currently in queue
     * @param {string} handle
     * @returns {boolean} - true for "yes, it is in queue"
     */
    static inQueue(handle) {
        return BlockerState.pendingQueue.indexOf(handle) >= 0;
    }

    /**
     * Take allowed max number of names from the queue
     * @returns {string[]}
     */
    static takeFromQueue() {
        const N = Math.min(BlockerState.pendingQueue.length,
            requestConfigs.maxLookupCount)
        return [...BlockerState.pendingQueue.splice(0, N)];
    }
}

