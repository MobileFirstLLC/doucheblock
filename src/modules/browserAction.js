// noinspection JSUnresolvedVariable,JSDeprecatedSymbols,JSUnresolvedFunction

import {OptionsPageURL, badgeColor, browserVariant} from "../config";
import Storage from "./storage";

/**
 * @description Handle extension browser action button click.
 * Clicking the icon opens options page. This module will also
 * set the icon badge value and allow updating it.
 *
 * @module
 * @name BrowserAction
 */
export default class BrowserAction {

    /**
     * @constructor
     * @name BrowserAction
     * @description Instantiate `new BrowserAction()` to
     * initialize badge count and register an icon click
     * handler.
     */
    constructor() {

        // clicking on browser action opens options page
        browserVariant().browserAction.onClicked.addListener(_ => {
            browserVariant().tabs.create({url: OptionsPageURL});
        });

        // when count broadcast is received, change badge count
        browserVariant().runtime.onMessage.addListener(
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
     * Convert large numbers to shorter display format
     * @param {number} value
     * @returns {string}
     */
    static formatBadgeCount(value) {
        return value < 10000 ?
            value.toString() :
            (value / 1000).toFixed(0) + "K"
    }

    /**
     * Update extension icon badge counter value
     * @param {number} value - the numeric value to display
     */
    static setBadge(value) {
        if (!value) return;
        const displayValue = BrowserAction.formatBadgeCount(value)
        browserVariant().browserAction
            .setBadgeText({text: displayValue});
        browserVariant().browserAction
            .setBadgeBackgroundColor({color: badgeColor});
    }
}
