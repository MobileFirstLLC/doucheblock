// noinspection JSUnresolvedVariable,JSCheckFunctionSignatures,JSDeprecatedSymbols

import {browserVariant} from '../config';

/**
 * @description
 * Dynamically capture necessary API credentials.
 *
 * This module will then provide the credentials to other modules that
 * need to use them, through message passing.
 *
 * This module must run in background context because it is using webRequest
 * chrome API. "webRequest" permission is required in extension manifest.
 * Also permission to read the specified domain (twitter.com) is required
 * in manifest.
 *
 * @module
 * @name Tokens
 */
export default class Tokens {

    /**
     * @constructor
     * @name Tokens
     * @description
     * Instantiate an object of this class to activate
     * token capture and message listener.
     */
    constructor() {
        browserVariant().webRequest.onBeforeSendHeaders.addListener(
            Tokens.getTheTokens,
            {urls: ['https://api.twitter.com/*']},
            ['requestHeaders']
        );
        browserVariant().runtime.onMessage
            .addListener(Tokens.messageListener);
    }

    /**
     * @static
     * @private
     * @returns {String|undefined}
     */
    static get bearerToken() {
        return this._token;
    }

    static set bearerToken(value) {
        this._token = value;
    }

    /**
     * @static
     * CSRF token getter
     * @returns {String|undefined}
     */
    static get csrfToken() {
        return this._csrf;
    }

    static set csrfToken(value) {
        this._csrf = value;
    }

    /**
     * @static
     * @description
     * Handle incoming messages from other parts of the extension.
     * This module will respond to requests whose body is `{tokens: true}`
     * (any truthy value works).
     *
     * @param {object} request request body
     * @param {*} request.tokens request authentication bearer and csrf tokens
     * @param {object} sender message sender info; populated by browser
     * @param {function} response callback function; response message will
     *  be returned over this callback
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
     * @static
     * @description match request headers
     */
    static parseHeader(header) {
        switch (header.name.toLowerCase()) {
            case 'authorization':
                Tokens.bearerToken = header.value;
                return 1;
            case 'x-csrf-token':
                Tokens.csrfToken = header.value;
                return 1;
            default:
                return 0;
        }
    }

    /**
     * @static
     * @description Capture the tokens on the fly
     * @param {Object} details webRequest object
     */
    static getTheTokens(details) {
        if (!details || !details.requestHeaders) return;
        let count = 0;
        for (let header of details.requestHeaders) {
            count += Tokens.parseHeader(header);
            if (count === 2) break;
        }
    }
}
