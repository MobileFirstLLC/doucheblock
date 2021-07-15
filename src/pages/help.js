// noinspection JSUnresolvedVariable,JSUnresolvedFunction

import Page from './page';

/**
 * User help page
 *
 * @module
 * @name HelpPage
 */
export default class Help extends Page {

    /**
     * @ignore
     */
    constructor() {
        super('help');

        Help.getElement('keywords').innerHTML = Help.translate('configuring_words');
        Help.getElement('whitelist').innerHTML = Help.translate('whitelist_help');
        Help.backButton.onclick = Help.backButton.onkeypress = Help.onBackClick;
    }

    /**
     * @private
     */
    static get backButton() {
        return Help.getElement('back');
    }

    /**
     * @private
     */
    static onBackClick() {
        window.location.assign('index.html');
    }
}
