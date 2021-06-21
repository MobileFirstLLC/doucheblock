// noinspection JSUnresolvedVariable,JSUnresolvedFunction

import Storage from '../modules/storage';
import Tabs from '../modules/tabs';
import Page from './page';

/**
 * Options page script. This script loads user
 * preferences then handles any changes to those
 * preferences.
 *
 * @module
 * @name OptionsPage
 */
export default class OptionsPage extends Page {

    /**
     * @ignore
     */
    constructor() {
        super('appName');

        // translate text elements
        OptionsPage.getElement('block-label').innerText = OptionsPage.translate('blockedWords');
        OptionsPage.getElement('confirm-label').innerText = OptionsPage.translate('confirmBlock');
        OptionsPage.getElement('help').innerText = OptionsPage.translate('help');
        OptionsPage.resetButtonText();

        // bind save button action
        OptionsPage.saveButton.onclick =
            OptionsPage.saveButton.onkeypress =
                OptionsPage.saveSettings;

        // load user settings
        OptionsPage.loadSettings();
        OptionsPage.loadIntro();
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
        return OptionsPage.getElement('confirm');
    }

    /**
     * Check if user has just installed.
     * @returns {boolean}
     */
    static get isIntro() {
        return new URLSearchParams(window.location.search).get('i') === '';
    }

    /**
     * Reset save button text
     */
    static resetButtonText() {
        OptionsPage.saveButton.innerText = OptionsPage.translate('saveChanges');
    }


    /**
     * Update user preferences
     */
    static saveSettings() {
        Storage.setBlockedWords(OptionsPage.blockInput.value, () => {
            Storage.setConfirmationSetting(OptionsPage.confirmInput.checked, () => {
                OptionsPage.saveButton.innerText = OptionsPage.translate('saved');
                Tabs.notifyTabsOfUpdate();
                window.setTimeout(OptionsPage.resetButtonText, 1000);
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
                OptionsPage.getElement('block-count').innerText =
                    (OptionsPage.translate('blockCount', count.toString()));
                OptionsPage.getElement('bmc').setAttribute(
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
            OptionsPage.getElement('intro').parentNode.style.display = 'block';
            OptionsPage.getElement('source').style.display =
                OptionsPage.getElement('share').style.display = 'none';
            close.onclick = _ => container.parentNode.removeChild(container);
            close.onkeypress = _ => container.parentNode.removeChild(container);
        }
    }
}
