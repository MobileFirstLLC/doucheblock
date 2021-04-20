// noinspection JSUnresolvedVariable,JSDeprecatedSymbols

import {OnInstallURL} from '../config'

/**
 * @description Handler for when user installs extension.
 * This module will launch options page. Register listener
 * by instantiating `new OnInstall()`.
 *
 * @module
 * @name OnInstall
 */
export default class OnInstall {

    /**
     * @constructor
     * @name OnInstall
     */
    constructor() {
        window.chrome.runtime.onInstalled.addListener(details => {
            if (details.reason === 'install') {
                window.chrome.tabs.create({url: OnInstallURL});
            }
        });
    }
}
