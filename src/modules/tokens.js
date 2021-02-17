// noinspection JSUnresolvedVariable,JSCheckFunctionSignatures,JSDeprecatedSymbols

/**
 * @description
 * Capture and provide necessary credentials.
 * This module must run in background context.
 *
 * @module
 * @name Tokens
 */
export default class Tokens {

    /**
     * @ignore
     */
    constructor() {
        window.chrome.webRequest.onBeforeSendHeaders.addListener(
            Tokens.getTheTokens,
            {urls: ["https://api.twitter.com/*"]},
            ["requestHeaders"]
        );
        window.chrome.runtime.onMessage
            .addListener(Tokens.messageListener);
    }

    /**
     * Bearer token getter
     * @returns {String|undefined}
     */
    static get bearerToken() {
        return this._token;
    }

    /**
     * Bearer token setter
     * @param {string} value
     */
    static set bearerToken(value) {
        this._token = value;
    }

    /**
     * CSRF token getter
     * @returns {String|undefined}
     */
    static get csrfToken() {
        return this._csrf;
    }

    /**
     * CSRF token setter
     * @param {string} value
     */
    static set csrfToken(value) {
        this._csrf = value;
    }

    /**
     * Allow other modules to request this info
     * @param {object} request - request body
     * @param {string} request.tokens - request for authentication tokens
     * @param {object} sender - message sender info
     * @param {function} response - callback
     * @returns {boolean}
     */
    static messageListener(request, sender, response) {
        if (request.tokens) {
            response({
                bearer: Tokens.bearerToken,
                csrf: Tokens.csrfToken
            });
            return true;
        }
    }

    /**
     * Capture these things on the fly....
     * @param details
     */
    static getTheTokens(details) {
        if (!details || !details.requestHeaders) return;
        let count = 0;
        for (let header of details.requestHeaders) {
            if (header.name.toLowerCase() === 'authorization') {
                Tokens.bearerToken = header.value
                count++;
            } else if (header.name.toLowerCase() === 'x-csrf-token') {
                Tokens.csrfToken = header.value
                count++;
            }
            if (count === 2) break;
        }
    }
}
