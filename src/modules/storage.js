// noinspection JSUnresolvedVariable,JSUnresolvedFunction

import {defaultConfig} from "../config";

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
            let result = {
                ...defaultConfig, ...res,
                [Storage.keys.confirm]:
                    res[Storage.keys.confirm] === undefined ?
                        defaultConfig.confirm : res[Storage.keys.confirm],
                [Storage.keys.blockWords]:
                    Storage.parseKeywords(res)
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
            window.chrome.runtime.sendMessage({increment: newCount});
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
        window.chrome.storage.sync.get(keys, callback);
    };

    /**
     * @function
     * @description save some property in storage
     * @param {String} key - one of `storage.keys`
     * @param {*} value - value to save
     * @param {function} callback - called after save operation has completed
     */
    static save(key, value, callback = undefined) {
        window.chrome.storage.sync.set({[key]: value}, callback);
    };
}
