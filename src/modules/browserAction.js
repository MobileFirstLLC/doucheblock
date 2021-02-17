// noinspection JSUnresolvedVariable,JSDeprecatedSymbols,JSUnresolvedFunction

import {OptionsPageURL, badgeColor} from "../config";
import Storage from "./storage";

/**
 * @description handle extension browser action button click
 *
 * @module
 * @name BrowserAction
 */
export default class BrowserAction {

    /**
     * @ignore
     */
    constructor() {

        // clicking on browser action opens options page
        window.chrome.browserAction.onClicked.addListener(_ => {
            window.chrome.tabs.create({url: OptionsPageURL});
        });

        // when count broadcast is received, change badge count
        window.chrome.runtime.onMessage.addListener(
            (request) => {
                if (request.increment) {
                    Storage.getBlockCount(BrowserAction.setBadge)
                    return true;
                }
            });

        // Initialize the badge count
        Storage.getBlockCount(BrowserAction.setBadge)
    }

    /**
     * Update extension icon badge counter value
     * @param {number} value - the numeric value to display
     */
    static setBadge(value) {
        if (!value) return;
        const displayValue = value < 10000 ?
            value.toString() :
            (value / 1000).toFixed(0) + "K"
        window.chrome.browserAction
            .setBadgeText({text: displayValue});
        window.chrome.browserAction
            .setBadgeBackgroundColor({color: badgeColor});
    }
}
