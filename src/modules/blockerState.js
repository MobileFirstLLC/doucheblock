import Storage from "./storage";
import TwitterApi from "./twitterApi";
import {requestConfigs, browserVariant, classFlag} from '../config'

// noinspection JSUnresolvedVariable,JSDeprecatedSymbols,JSUnresolvedFunction
/**
 * @description
 * Basic object for managing state
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
        return !!(BlockerState.csrfToken && BlockerState.bearerToken)
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
     * Get the list of whitelisted handles
     * @returns {Object<string,string>}
     */
    static get whiteList() {
        return this._whiteList || {};
    }

    /**
     * Setter for list of white listed handles
     * @param {Object<string,string>} value
     */
    static set whiteList(value) {
        this._whiteList = value;
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
        return BlockerState.handleCheckList.indexOf(handle) >= 0;
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
     * Add a handle to pending queue
     * @param {string} value
     */
    static addToQueue(value) {
        this._pendingQueue = (BlockerState.pendingQueue).concat([value]);
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
     * Whether given handle is currently in queue
     * @param {string} handle
     * @returns {boolean} - true for "yes, it is in queue"
     */
    static currentlyInQueue(handle) {
        return BlockerState.pendingQueue.indexOf(handle) >= 0;
    }
}
