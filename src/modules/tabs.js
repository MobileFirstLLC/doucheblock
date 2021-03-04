// noinspection JSUnresolvedVariable,JSCheckFunctionSignatures,JSUnresolvedFunction,JSIgnoredPromiseFromCall

import {browserVariant} from "../config";

/**
 * @description
 * Notify open tabs when user preferences have changed to
 * propagate that change without tab reload; each tab will
 * refresh their user settings info after receiving this message.
 * This module should run in background context.
 *
 * @module
 * @name Tabs
 */
export default class Tabs {

    /**
     * Call this method to broadcast settings change to all
     * subscribed tabs.
     */
    static notifyTabsOfUpdate() {
        browserVariant.tabs.query({}, tabs => {
            for (let i = 0; i < tabs.length; ++i) {
                // send message to update
                browserVariant.tabs.sendMessage(tabs[i].id,
                    {updateSettings: true}
                );
            }
        });
    }
}
