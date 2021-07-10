import {shareLinks} from '../config';

/**
 * Base class for page scripts to setup shared functionality
 * across the extension pages
 *
 * @module
 * @name Page
 */
export default class Page {

    constructor(title) {
        Page.setTitle(title);
        Page.setupShare();
    }

    /**
     * Get localized text value
     * @param {string} key - localization dictionary key
     * @param {string|undefined} args - placeholder
     * @returns {string}
     */
    static translate(key, args = undefined) {
        return window.chrome.i18n.getMessage(key, args);
    }

    /**
     * Setup page title
     * @param value
     */
    static setTitle(value) {
        Page.getElement('title').innerText = document.title = Page.translate(value);
    }

    /**
     * Get some DOM element by its ID
     * @param id - DOM element id
     * @returns {HTMLElement}
     */
    static getElement(id) {
        return document.getElementById(id);
    }

    /**
     * Generate share links
     */
    static setupShare() {
        const links = Object.values(shareLinks).map(Page.makeShareLink).join('');
        const label = document.createElement('p');

        label.innerHTML = Page.translate('links');
        Page.getElement('share').innerHTML = links;
        Page.getElement('share').prepend(label);
    }

    /**
     * Generate a share link
     * @param {string} label - i18n dictionary key
     * @param {string} url - the URL to share
     * @param {string} svgPath - icon path
     * @returns {string} generated HTML
     */
    static makeShareLink({label, url, svgPath}) {
        const icon = `<svg viewBox="0 0 24 24"><path d="${svgPath}" /></svg>`;
        return `<a href="${url}" title="${Page.translate(label)}">${icon}</a>`;
    }
}
