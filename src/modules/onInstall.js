// noinspection JSUnresolvedVariable,JSDeprecatedSymbols

import {OptionsPageURL} from '../config'

/**
 * @description Handler for when user installs extension.
 * This module will launch options page. Register listener
 * by calling the constructor of this module.
 *
 * @module
 * @name OnInstall
 */
export default class OnInstall {

    /**
     * @ignore
     */
    constructor() {
        window.chrome.runtime.onInstalled.addListener(details => {
            if (details.reason === 'install') {
                window.chrome.tabs.create({url: OptionsPageURL});
            }
        });
    }
}
