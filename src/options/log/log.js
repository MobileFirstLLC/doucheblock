// noinspection JSUnresolvedVariable,JSUnresolvedFunction

import Storage from '../../modules/storage';
import {maxLogSize} from '../../config';
import Page from '../page';

/**
 * Log page shows a list of recent blocks.
 *
 * @module
 * @name LogPage
 */
export default class Log extends Page {

    /**
     * @ignore
     */
    constructor() {
        super('log');
        Log.logTarget.innerText = Log.translate('log_loading');
        Log.logIntro.innerText = Log.translate('log_intro', maxLogSize.toString());

        Storage.getLog(logEntries => {
            if (!logEntries || !logEntries.length) {
                Log.logTarget.setAttribute('class', 'empty');
                Log.logTarget.innerHTML = Log.translate('log_empty');
            } else {
                Log.logTarget.innerHTML = '';
                for (let i = 0; i < logEntries.length; i++) {
                    Log.logTarget.appendChild(Log.renderLogEntry(logEntries[i]));
                }
            }
        });
    }

    /**
     * @ignore
     */
    static get logTarget() {
        return Log.getElement('log');
    }

    /**
     * @ignore
     */
    static get logIntro() {
        return Log.getElement('log-intro');
    }

    static generateDomNode(className, textValue = '', type = 'div') {
        const node = document.createElement(type);
        node.setAttribute('class', className);
        node.innerText = textValue;
        return node;
    }

    /**
     * @ignore
     */
    static renderLogEntry({bio, name, handle, match, ts, img}) {

        const block = document.createElement('div');
        block.setAttribute('class', 'entry');

        const name_ = Log.generateDomNode('name');

        if (img) {
            const image = document.createElement('img');
            image.setAttribute('src', img);
            name_.prepend(image);
        }
        name_.appendChild(Log.generateDomNode('display', name, 'span'));
        name_.appendChild(Log.generateDomNode('handle', `@${handle}`, 'span'));
        block.appendChild(name_);

        block.appendChild(Log.generateDomNode('bio', bio));

        const meta = Log.generateDomNode('meta');
        meta.appendChild(Log.generateDomNode('match',
            Log.translate('match_desc'), 'span'));
        meta.appendChild(Log.generateDomNode('word', match, 'code'));

        meta.appendChild(Log.generateDomNode('time',
            Log.translate('block_ts', new Date(ts).toLocaleString()), 'span'));
        block.appendChild(meta);

        // return the block
        return block;
    }
}
