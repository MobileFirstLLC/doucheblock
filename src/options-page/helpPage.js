// noinspection JSUnresolvedVariable,JSUnresolvedFunction

import Page from './page';

/**
 * User help page
 *
 * @module
 * @name HelpPage
 */
export default class HelpPage extends Page {

    /**
     * @ignore
     */
    constructor() {
        super('help');

        HelpPage.getElement('keywords').innerHTML = HelpPage.translate('configuring_words');
        HelpPage.getElement('whitelist').innerHTML = HelpPage.translate('whitelist_help');
        HelpPage.backButton.onclick = HelpPage.backButton.onkeypress = HelpPage.onBackClick;
    }

    /**
     * @private
     * @returns {HTMLElement}
     */
    static get backButton() {
        return HelpPage.getElement('back');
    }

    /**
     * @private
     * Handle back button click
     */
    static onBackClick() {
        window.location.href = 'index.html';
    }
}
