// noinspection JSUnresolvedVariable,JSCheckFunctionSignatures,JSUnresolvedFunction,JSIgnoredPromiseFromCall

import {browserVariant, isFirefox} from '../config';

/**
 * @description
 * This module will notify all open tabs when user preferences
 * have changed to propagate that change without needing tab
 * reload. Each tab running extension content script will know
 * refresh their user settings after receiving this message,
 * because every content script will auto-subscribe to this message
 * when the content script is instantiated. Non-extension tabs
 * will do nothing.
 *
 * This module should run in background context.
 *
 * @module
 * @name Tabs
 */
export default class Tabs {

    /**
     * @static
     * @description
     * Call this method to broadcast settings change to all
     * subscribed tabs.
     */
    static notifyTabsOfUpdate() {
        if (isFirefox) {
            browserVariant().tabs.query(
                {url: 'https://*.twitter.com/*'})
                .then(tabs => {
                    for (let tab of tabs) {
                        browser.tabs.sendMessage(
                            tab.id, {updateSettings: true})
                            .then().catch();
                    }
                }).catch();
        } else {
            browserVariant().tabs.query({}, tabs => {
                for (let i = 0; i < tabs.length; ++i) {
                    browserVariant().tabs.sendMessage(tabs[i].id,
                        {updateSettings: true}
                    );
                }
            });
        }
    }
}
