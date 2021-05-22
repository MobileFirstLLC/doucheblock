// noinspection JSUnresolvedVariable,JSUnresolvedFunction

import Storage from "../modules/storage";
import Tabs from "../modules/tabs";
import {shareLinks, rateLink} from "../config";

/**
 * Options page script. This script loads user
 * preferences then handles any changes to those
 * preferences.
 *
 * @module
 * @name OptionsPage
 */
export default class OptionsPage {

    /**
     * @ignore
     */
    constructor() {

        // translate text elements
        const title = OptionsPage.translate('appName');
        OptionsPage.getElement('title').innerText = document.title = title;
        OptionsPage.getElement('block-label').innerText = OptionsPage.translate('blockedWords');
        OptionsPage.getElement('confirm-label').innerText = OptionsPage.translate('confirmBlock');
        OptionsPage.getElement('source-label').innerText = OptionsPage.translate('source');
        OptionsPage.resetButtonText();

        // bind save button action
        OptionsPage.saveButton.onclick =
            OptionsPage.saveButton.onkeypress =
                OptionsPage.saveSettings;

        // load user settings
        OptionsPage.loadSettings();
        OptionsPage.loadIntro();
        OptionsPage.setupShare();
    }

    /**
     * Get save button DOM element
     * @returns {HTMLElement}
     */
    static get saveButton() {
        return OptionsPage.getElement('save');
    }

    /**
     * Get block keywords input DOM element
     * @returns {HTMLElement}
     */
    static get blockInput() {
        return OptionsPage.getElement('block-words');
    }

    /**
     * Get "confirm blocks" checkbox DOM element
     * @returns {HTMLElement}
     */
    static get confirmInput() {
        return OptionsPage.getElement('confirm')
    }

    /**
     * Get bmc DOM element
     * @returns {HTMLElement}
     */
    static get BMC() {
        return OptionsPage.getElement('bmc');
    }

    /**
     * Check if user has just installed.
     * @returns {boolean}
     */
    static get isIntro(){
        return new URLSearchParams(window.location.search).get('i') === "";
    }

    /**
     * New user intro block
     * @returns {HTMLElement}
     */
    static get IntroBlock() {
        return OptionsPage.getElement('intro');
    }

    /**
     * Get DOM element that displays number of blocks
     * @returns {HTMLElement}
     */
    static get blockCount() {
        return OptionsPage.getElement('block-count');
    }

    /**
     * Reset save button text
     */
    static resetButtonText() {
        OptionsPage.saveButton.innerText = OptionsPage.translate('saveChanges');
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
     * Get some DOM element by its ID
     * @param id - DOM element id
     * @returns {HTMLElement}
     */
    static getElement(id) {
        return document.getElementById(id);
    }

    /**
     * Update user preferences
     */
    static saveSettings() {
        Storage.setBlockedWords(OptionsPage.blockInput.value, () => {
            Storage.setConfirmationSetting(OptionsPage.confirmInput.checked, () => {
                OptionsPage.saveButton.innerText = OptionsPage.translate('saved');
                Tabs.notifyTabsOfUpdate();
                window.setTimeout(OptionsPage.resetButtonText, 1000)
            });
        });
    }

    /**
     * Load user preferences and populate inputs
     */
    static loadSettings() {
        Storage.getSettings(settings => {
            const count = parseInt(settings[Storage.keys.count]);

            // set the inputs
            OptionsPage.blockInput.value =
                (settings[Storage.keys.blockWords] || []).join(', ');
            OptionsPage.confirmInput.checked =
                settings[Storage.keys.confirm];

            // if enough blocks -> reveal additional content
            if (count > 1 && !OptionsPage.isIntro) {
                OptionsPage.blockCount.innerText =
                    (OptionsPage.translate('blockCount', count.toString()))
                OptionsPage.BMC.setAttribute(
                    'visible', 'visible');
            }
        });
    }

    /**
     * Generate an intro message to new user. When showing
     * intro, hide the "other" distractions around the screen.
     */
    static loadIntro() {
        if (OptionsPage.isIntro) {
            const container = OptionsPage.getElement('intro-container');
            const close = OptionsPage.getElement('close-intro');

            OptionsPage.getElement('intro-greeting').innerHTML = OptionsPage.translate('intro_greeting');
            OptionsPage.getElement('intro-text').innerHTML = OptionsPage.translate('intro_text');
            OptionsPage.IntroBlock.parentNode.style.display = 'block';
            OptionsPage.getElement('source').style.display =
                OptionsPage.getElement('share').style.display = 'none';
            close.onclick = _ => container.parentNode.removeChild(container)
            close.onkeypress = _ => container.parentNode.removeChild(container)
        }
    }

    /**
     * Generate share links
     */
    static setupShare() {
        const links = Object.values(shareLinks).map(OptionsPage.makeShareLink).join('');
        const label = document.createElement('p');

        label.innerHTML = OptionsPage.translate('share_and_rate');
        OptionsPage.getElement('share').innerHTML = links;
        OptionsPage.getElement('share').prepend(label);
    }

    /**
     * Generate a share link
     * @param {string} label - i18n dictionary key
     * @param {string} url - the URL to share
     * @param {string} svgPath - icon path
     * @returns {string} generated HTML
     */
    static makeShareLink({label, url, svgPath}) {
        const icon = `<svg viewBox="0 0 24 24"><path d="${svgPath}" /></svg>`
        return `<a href="${url}" title="${OptionsPage.translate(label)}">${icon}</a>`;
    }
}
