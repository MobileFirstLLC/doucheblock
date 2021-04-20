/** * * * * * * * * * * * * * * * * * * * *
 *
 * Automatically block users with specific
 * keywords in bio
 *
 * Author: Mobile First LLC
 * Website: https://mobilefirst.me
 *
 * @description
 * Application configs
 *
 * * * * * * * * * * * * * * * * * * * * */

/*
 * URL to options page
 *
 * @constant
 * @type {string}
 */
export const OptionsPageURL = "index.html"

/*
 * Default user settings
 *
 * @constant
 * @type {Object}
 */
export const defaultConfig = {
    /**
     * Default list of keywords that will cause blocking until user
     * defines their own block list.
     * @constant
     * @type {string}
     */
    blockWords: "catalyst,innovator,futurist,serial entrepreneur,midas list",
    /**
     * Ask user to manually confirm all blocks
     * @constant
     * @type {Boolean}
     */
    confirm: true,
    /**
     * Number of accounts blocked by this extension
     * @constant
     * @type {number}
     */
    count: 0
}

/*
 * Twitter API configuration
 *
 * @constant
 * @type {Object}
 */
export const requestConfigs = {
    /**
     * Do not make bio requests more frequently than this limit.
     * Need to stay moderate here...or else you get 429
     *
     * @constant
     * @type {number}
     */
    maxInterval: 20 * 1000,
    /**
     * Max number of handles to add to single bio request. This
     * is not a variable, this is a fixed number enforced by Twitter.
     * But you can make it smaller to reduce batch size.
     *
     * @constant
     * @type {number}
     */
    maxLookupCount: 100,
    /**
     * Endpoint for obtaining bios
     * @param handles - specify comma separated list of handles
     * @returns {string} - formatted URL
     */
    bioEndpoint: handles => 'https://api.twitter.com/1.1/users/lookup.json?skip_status=1&screen_name=' + handles,
    /**
     * API endpoint for blocking a user
     *
     * @constant
     * @type {string}
     */
    blockEndpoint: 'https://twitter.com/i/api/1.1/blocks/create.json',
}

/*
 * Determine if current browser is Firefox
 *
 * @constant
 * @type {Boolean}
 */
export const isFirefox = navigator.userAgent.indexOf('Firefox') > -1;

/*
 * Determine if current browser is Edge
 *
 * @constant
 * @type {Boolean}
 */
export const isEdge = window.navigator.userAgent.indexOf("Edg/") > -1;

/*
 * Determine if current browser is Opera
 *
 * @constant
 * @type {Boolean}
 */
export const isOpera = !!window.opr;

/*
 * Determine if current browser is Chrome
 *
 * @constant
 * @type {Boolean}
 */
export const isChrome = !(isEdge || isOpera || isFirefox);

/*
 * Extension/addon APIs reference
 * Use this method to dynamically determine the right context
 * based on browser; this is purposely a method to make this
 * work during unit testing.
 *
 * @type {Function}
 */
export const browserVariant = _ => isFirefox ? browser : window.chrome;

/*
 * Define browser action badge color
 * Browsers that default to black badge text color: Firefox
 * Browsers that default to white badge text color: Chrome, edge
 * For contrast, use yellow bg with dark text / red bg with white text
 *
 * @constant
 * @type {String}
 */
export const badgeColor = isFirefox ? "#FDD835" : "#ff1744"

/**
 * Flag for marking checked DOM elements. This value can be anything,
 * but it needs to be sufficiently unique so it doesn't clash with
 * actual class names.
 *
 * @constant
 * @type {String}
 */
export const classFlag = 'dbt___seen-it-b4'
