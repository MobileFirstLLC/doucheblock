// noinspection JSUnresolvedVariable,JSDeprecatedSymbols

import {OnInstallURL} from '../config'

/**
 * @description
 * Handler for when user installs extension.
 * The on install behavior is to launch extension options page.
 *
 * @module
 * @name OnInstall
 */
export default class OnInstall {

    /**
     * @constructor
     * @name OnInstall
     * @description Instantiating `new OnInstall()` to register OnInstall event listener.
     */
    constructor() {
        window.chrome.runtime.onInstalled.addListener(details => {
            if (details.reason === 'install') {
                window.chrome.tabs.create({url: OnInstallURL});
            }
        });
    }
}
