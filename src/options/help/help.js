// noinspection JSUnresolvedVariable,JSUnresolvedFunction

import Page from '../page';

/**
 * User help page with FAQ/instructions type stuff.
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
    }
}
