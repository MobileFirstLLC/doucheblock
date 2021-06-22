import AutoBlocker from '../src/modules/autoblocker';
import {defaultConfig} from '../src/config';
import MockMutationObserver from './_mocks';
import BlockerState from '../src/modules/blockerState';

describe('Content script', () => {

    beforeEach(() => {
        global.MutationObserver = MockMutationObserver;
        chrome.storage.sync.get.yields(defaultConfig);
    });

    afterEach(function () {
        chrome.flush();
        sandbox.restore();
    });

    it('It loads user preferences', () => {
        sandbox.spy(AutoBlocker, 'loadSettings');
        new AutoBlocker(); // init
        expect(AutoBlocker.loadSettings.calledOnce,
            'loads settings on init').to.be.true;
    });

    it('Matches keywords', () => {
        chrome.storage.sync.get.yields({
            ...defaultConfig,
            blockWords: 'Serial Entrepreneur,micros*,\\bvision'
        });
        new AutoBlocker();

        expect(AutoBlocker.checkWords(
            'CEO Keynote Speaker, GoogleDevExpert, MSFT MVP, Serial Entrepreneur, Investor'),
            'Serial Entrepreneur (plain)').to.be.true;
        expect(AutoBlocker.checkWords(
            '@Microsoft by day Aspiring to bloom where planted.'),
            '*icros* (wildcard)').to.be.true;
        expect(AutoBlocker.checkWords(
            'Entrepreneur | Innovator with a ViSiOn to eliminate diagnostic errors using Artificial Intelligence'),
            '\\bvision/gmi (case)').to.be.true;
    });
});


