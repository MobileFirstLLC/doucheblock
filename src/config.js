/** * * * * * * * * * * * * * * * * * * * *
 * Automatically block users with specific
 * keywords in bio
 *
 * @description
 * Application configs
 * * * * * * * * * * * * * * * * * * * * */

/*
 * Options page URL
 *
 * @constant
 * @type {string}
 */
export const OptionsPageURL = 'index.html';

/*
 * Options page URL when user has just installed.
 * (Add a flag to the URL to distinguish this event)
 *
 * @constant
 * @type {string}
 */
export const OnInstallURL = OptionsPageURL + '?i';

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
    blockWords: 'catalyst,innovator,futurist,serial entrepreneur,midas list',
    /**
     * Default list of keywords that will prevent blocking until user
     * defines their own allow list.
     * @constant
     * @type {string}
     */
    allowWords: 'magazine',
    /**
     * mute instead of block
     * @constant
     * @type {Boolean}
     */
    mute: false,
    /**
     * Ask user to manually confirm all blocks or mutes
     * @constant
     * @type {Boolean}
     */
    confirm: true,
    /**
     * Number of accounts blocked or muted by this extension
     * @constant
     * @type {number}
     */
    count: 0,
    /**
     * Whitelisted handles that are not subject to blocking
     * @constant
     * @type {Object<string, string>}
     */
    whiteList: {},
    /**
     * Block log contains history of blocks
     * @constant
     * @type {Array<Object>}
     */
    log:[]
};

/*
 * Twitter API configuration
 *
 * @constant
 * @type {Object}
 */
export const requestConfigs = {
    /**
     * Do not make bio requests more frequently than this limit (in milliseconds).
     * Need to stay moderate here...or else you get 429.
     *
     * @constant
     * @type {number}
     */
    maxInterval: 15 * 1000,
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
     * @param {string} handles - comma separated list of handles
     * @returns {string} - formatted URL
     */
    bioEndpoint: handles => 'https://api.twitter.com/1.1/users/lookup.json?skip_status=1&screen_name=' + handles,
    /**
     * API endpoint for blocking a user
     *
     * @constant
     * @type {string}
     *
     * Example: POST https://api.twitter.com/1.1/blocks/create.json?screen_name=theSeanCook&skip_status=1
     */
    blockEndpoint: 'https://twitter.com/i/api/1.1/blocks/create.json',
    /**
     * API endpoint for muting a user
     *
     * @constant
     * @type {string}
     *
     * This differs from blocks, in that it always returns a JSON array for status... no skip_status flag available for mutes
     *
     * ref: https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/mute-block-report-users/api-reference/post-mutes-users-create
     */
    muteEndpoint: 'https://api.twitter.com/1.1/mutes/users/create.json',
    /**
     * Endpoint for checking current friendship status between self and some other user.
     * @param {string} handle - specify only 1 username
     * @returns {string} - formatted URL
     */
    friendshipEndpoint: handle => `https://twitter.com/i/api/graphql/Vf8si2dfZ1zmah8ePYPjDQ/UserByScreenNameWithoutResults?variables=%7B%22screen_name%22%3A%22${handle}%22%2C%22withHighlightedLabel%22%3Atrue%7D`
};

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
export const isEdge = navigator.userAgent.indexOf('Edg/') > -1;

/*
 * Determine if current browser is Opera
 *
 * @constant
 * @type {Boolean}
 */
export const isOpera = !!window.opr;

/*
 * Determine if current browser is Safari
 *
 * @constant
 * @type {Boolean}
 */
export const isSafari = navigator.vendor.match(/apple/i) &&
    !navigator.userAgent.match(/crios/i) &&
    !navigator.userAgent.match(/fxios/i);

/*
 * Determine if current browser is Chrome (might also be Brave)
 *
 * @constant
 * @type {Boolean}
 */
export const isChrome = !(isEdge || isOpera || isFirefox || isSafari);

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
 * Browsers that default to white badge text color: Chrome, Edge, Opera
 * For contrast, use yellow bg with dark text / red bg with white text
 *
 * @constant
 * @type {String}
 */
export const badgeColor = isFirefox ? '#FDD835' : '#ff1744';

/**
 * Flag for marking checked DOM elements. This value can be anything,
 * but it needs to be sufficiently unique so it doesn't clash with
 * actual class names.
 *
 * @constant
 * @type {String}
 */
export const classFlag = 'dbt___seen-it-b4';

/**
 * Maximum number of alerts to show sequentially
 *
 * @constant
 * @type {number}
 */
export const alertCap = 3;

/**
 * Size of block log: maximum number of entries to log
 * @constant
 * @type {number}
 */
export const maxLogSize = 100;

/**
 * URLs for rating extension, depends on the current browser.
 *
 * @returns {String|undefined}
 */
const rateURL = () => {
    let link;
    if (isFirefox) {
        link = 'https://addons.mozilla.org/en-US/firefox/addon/doucheblock-for-twitter';
    } else if (isChrome) {
        link = 'https://chrome.google.com/webstore/detail/eeledoologbepiegnccedjigjkblhmhi/reviews';
    } else if (isEdge) {
        link = 'https://microsoftedge.microsoft.com/addons/detail/jjamkfoaemeiacomhpidlhkjinmpmkpj';
    } else if (isOpera) {
        link = 'https://addons.opera.com/en/extensions/details/doucheblock-for-twitter/';
    } else if (isSafari) {
        link = 'https://apps.apple.com/us/app/doucheblock-for-twitter/id1576147372';
    }
    return link;
};

/**
 * List of social share options with associated icon and label.
 *
 * @constant
 * @type {Object}
 */
export const shareLinks = {
    github: {
        label: 'source',
        url: 'https://github.com/MobileFirstLLC/doucheblock',
        svgPath: 'M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14' +
            ' 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,' +
            '15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,' +
            '16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 ' +
            '7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 ' +
            '17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,' +
            '16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,' +
            '21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z'
    },
    rate: {
        url: rateURL(),
        label: isFirefox || isEdge ? 'rate_addon' : 'rate_extension',
        svgPath: 'M12,15.39L8.24,17.66L9.23,13.38L5.91,10.5L10.29,10.13L12,6.09L13.71,10.13L18.09,10.5L14.77,13.38L15.76,' +
            '17.66M22,9.24L14.81,8.63L12,2L9.19,8.63L2,9.24L7.45,13.97L5.82,21L12,17.27L18.18,21L16.54,13.97L22,9.24Z'
    },
    twitter: {
        label: 'share_twitter',
        url: 'https://twitter.com/intent/tweet?text=@DoucheBlock%20',
        svgPath: 'M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 ' +
            '19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,' +
            '9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 ' +
            '2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,' +
            '14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,' +
            '19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,' +
            '8.23C21.16,7.63 21.88,6.87 22.46,6Z'
    }
};
