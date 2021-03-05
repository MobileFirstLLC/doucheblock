// noinspection JSUnresolvedVariable,JSUnresolvedFunction

import {defaultConfig, isOpera, isFirefox, browserVariant} from "../config";

/**
 * Application storage for persisting data. This module can
 * be used from content script and background context.
 *
 * @module
 * @name Storage
 */
export default class Storage {

    /**
     * Use keys to avoid typing string literals.
     * These keys are case sensitive
     */
    static get keys() {
        return {
            blockWords: 'blockWords',
            confirm: 'confirm',
            count: 'count'
        };
    };

    static get storageImplementation() {
        if (isOpera || isFirefox)
            return chrome.storage.local;
        else
            return chrome.storage.sync;
    }

    /**
     * Convert blocked keywords string into an array
     * @param input
     * @returns {string[]}
     */
    static parseKeywords(input) {
        return (input[Storage.keys.blockWords] ||
            defaultConfig.blockWords)
            .split(',')
    }

    /**
     * Get all user settings
     * @param {function} callback
     */
    static getSettings(callback) {
        Storage.get(null, res => {
            const {confirm: c, blockWords: bw} = Storage.keys
            const result = {
                ...defaultConfig, ...res,
                [c]: res[c] === undefined ?
                    defaultConfig.confirm : res[c],
                [bw]: Storage.parseKeywords(res)
            }
            callback(result);
        })
    }

    /**
     * Get number of blocks performed by this extension
     * @param {function} callback
     */
    static getBlockCount(callback) {
        Storage.get(Storage.keys.count, res =>
            callback(parseInt(res[Storage.keys.count] || 0)));
    }

    /**
     * Update the list of trigger keywords; this function
     * will sanitize and strip the input
     *
     * @param {string} words - list of words to block
     * @param {function} done - callback
     */
    static setBlockedWords(words, done = undefined) {
        const list = (words || '').toLowerCase().split(',')
        const strList = list.map(w => (w || '')
            .trim()).filter(f => f.length).join(',');
        Storage.save(Storage.keys.blockWords, strList, done);
    }

    /**
     * Update confirmation prompt user preference
     * @param {Boolean} value - set true to ask user before blocking
     * @param {function} done - callback
     */
    static setConfirmationSetting(value, done = undefined) {
        Storage.save(Storage.keys.confirm, !!value, done);
    }

    /**
     * Update the count of block requests
     */
    static incrementCount() {
        Storage.get(Storage.keys.count, res => {
            const newCount = (res[Storage.keys.count] || 0) + 1;
            Storage.save(Storage.keys.count, newCount);
            // do not assume background context!
            // broadcast this change to all interested listeners
            browserVariant().runtime.sendMessage({increment: newCount});
        });
    }

    /**
     * @function
     * @description get some property from storage
     * @param {String|Array<String>} keys must be one of `storage.keys` or `null`.
     * If `null`, entire contents of the storage will be returned.
     * @param {function} callback - function to call with result
     */
    static get(keys, callback) {
        Storage.storageImplementation.get(keys, callback);
    };

    /**
     * @function
     * @description save some property in storage
     * @param {String} key - one of `storage.keys`
     * @param {*} value - value to save
     * @param {function} callback - called after save operation has completed
     */
    static save(key, value, callback = undefined) {
        Storage.storageImplementation.set({[key]: value}, callback);
    };
}
