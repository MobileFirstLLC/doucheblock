// noinspection JSUnresolvedVariable,JSUnresolvedFunction

import {defaultConfig, isOpera, isFirefox, browserVariant, maxLogSize} from '../config';

/**
 * @description
 * Application storage for persisting data. This module is shared and can be used
 * anywhere inside the extension (content script, background context, etc).
 *
 * @module
 * @name Storage
 */
export default class Storage {

    /**
     * @static
     * @description
     * Use keys to avoid typing string literals because
     * storage keys are case sensitive.
     */
    static get keys() {
        return {
            blockWords: 'blockWords',
            allowWords: 'allowWords',
            confirm: 'confirm',
            mute: 'mute',
            count: 'count',
            whiteList: 'whiteList',
            log: 'log'
        };
    };

    /**
     * @static
     * @private
     * @description
     * Determine which storage implementation to use based on current browser.
     * @returns - storage implementation; either local or sync
     */
    static get storageImplementation() {
        if (isOpera || isFirefox) {
            return chrome.storage.local;
        } else {
            return chrome.storage.sync;
        }
    }

    /**
     * @static
     * @private
     * @description Convert blocked keywords string into an array
     * @param input
     * @returns {string[]}
     */
    static parseKeywords(input) {
        return (input[Storage.keys.blockWords] ||
            defaultConfig.blockWords)
            .split(',');
    }

    /**
     * @static
     * @private
     * @description Convert allowed keywords string into an array
     * @param input
     * @returns {string[]}
     */
    static parseAllowedKeywords(input) {
        return (input[Storage.keys.allowWords] ||
            defaultConfig.allowWords)
            .split(',');
    }
    
    /**
     * @static
     * @description Get all user settings (except log)
     * @param {function} callback
     */
    static getSettings(callback) {
        const keys = Object.values(Storage.keys)
            .filter(val => val !== Storage.keys.log);
        Storage.get(keys, res => {
            const {confirm: c, mute: m, blockWords: bw, allowWords: aw, whiteList: wl} = Storage.keys;
            const result = {
                ...defaultConfig, ...res,
                [c]: res[c] === undefined ? defaultConfig.confirm : res[c],
                [m]: res[m] === undefined ? defaultConfig.mute : res[m],
                [bw]: Storage.parseKeywords(res),
                [aw]: Storage.parseAllowedKeywords(res),
                [wl]: res[wl] || {}
            };
            callback(result);
        });
    }

    /**
     * @static
     * @description
     * Get number of blocks performed by this extension
     * @param {function} callback
     */
    static getBlockCount(callback) {
        Storage.get(Storage.keys.count, res =>
            callback(parseInt(res[Storage.keys.count] || 0)));
    }

    /**
     * @static
     * @description
     * Update the list of trigger keywords; this function
     * will sanitize and strip the input
     *
     * @param {string} words - list of words to block
     * @param {function} done - callback
     */
    static setBlockedWords(words, done = undefined) {
        const list = (words || '').toLowerCase().split(',');
        const strList = list.map(w => (w || '')
            .trim()).filter(f => f.length).join(',');
        Storage.save(Storage.keys.blockWords, strList, done);
    }
    
    /**
     * @static
     * @description
     * Update the list of allowed keywords; this function
     * will sanitize and strip the input
     *
     * @param {string} words - list of words to block
     * @param {function} done - callback
     */
    static setAllowedWords(words, done = undefined) {
        const list = (words || '').toLowerCase().split(',');
        const strList = list.map(w => (w || '')
            .trim()).filter(f => f.length).join(',');
        Storage.save(Storage.keys.allowWords, strList, done);
    }
    
    /**
     * @static
     * @description
     * Update confirmation prompt user preference
     * @param {Boolean} value - set true to ask user before blocking
     * @param {function} done - callback
     */
    static setConfirmationSetting(value, done = undefined) {
        Storage.save(Storage.keys.confirm, !!value, done);
    }

    /**
     * @static
     * @description
     * Update mute user preference
     * @param {Boolean} value - set true to mute instead of block
     * @param {function} done - callback
     */
    static setMuteSetting(value, done = undefined) {
        Storage.save(Storage.keys.mute, !!value, done);
    }

    /**
     * @static
     * @description
     * Update the count of completed block requests
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
     * @static
     * @description
     * Add new entry to whitelist
     */
    static addWhiteList(entry, callback) {
        Storage.get(Storage.keys.whiteList, res => {
            const initList = res[Storage.keys.whiteList] || {};
            const newList = {...initList, ...entry};
            Storage.save(Storage.keys.whiteList, newList);
            callback(newList);
        });
    }

    /**
     * @static
     * @description Get the block log
     * @param {function} callback - current log
     */
    static getLog(callback) {
        Storage.get(Storage.keys.log, res =>
            callback(res[Storage.keys.log] || defaultConfig.log));
    }

    /**
     * @static
     * @description
     * Update the block log
     * @param {Object} entry - entry to add to the log
     * @param {function?} callback - returns updated log
     */
    static addLog(entry, callback = () => false) {
        Storage.getLog(oldList => {
            if (!entry) return callback(oldList);
            entry.ts = Date.now(); // record log timestamp
            const newList = ([entry, ...oldList]).slice(0, maxLogSize);
            Storage.save(Storage.keys.log, newList);
            callback(newList);
        });
    }

    /**
     * @static
     * @private
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
     * @static
     * @private
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
