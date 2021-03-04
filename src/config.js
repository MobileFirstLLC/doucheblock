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

// URL to options page
export const OptionsPageURL = "index.html"

// Default user settings
export const defaultConfig = {
    /**
     * Default list of keywords that will cause blocking until user
     * defines their own block list.
     * @type {string}
     */
    blockWords: "catalyst,innovator,futurist,serial entrepreneur,midas list",
    /**
     * Ask user to manually confirm all blocks
     */
    confirm: true,
    /**
     * Number of accounts blocked by this extension
     */
    count: 0
}

// Twitter API configuration
export const requestConfigs = {
    /**
     * Do not make bio requests more frequently than this limit.
     * Need to stay moderate here...or else you get 429
     */
    maxInterval: 30 * 1000,
    /**
     * Max number of handles to add to single bio request. This
     * is not a variable, this is a fixed number enforced by Twitter.
     * But you can make it smaller to reduce batch size.
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
     */
    blockEndpoint: 'https://twitter.com/i/api/1.1/blocks/create.json',
}

// variables for different browser targets
export const isFirefox = navigator.userAgent.indexOf('Firefox') > -1;
export const isEdge = window.navigator.userAgent.indexOf("Edg/") > -1;
export const isOpera = !!window.opr;
export const isChrome = !(isEdge || isOpera || isFirefox);
export const browserVariant = isFirefox ? browser : window.chrome;


// Define browser action badge color
// Browsers that default to black badge text color: Firefox
// Browsers that default to white badge text color: Chrome, edge
// For contrast, use yellow bg with dark text / red bg with white text
export const badgeColor = isFirefox ? "#FDD835": "#ff1744"
