import AutoBlocker from '../src/modules/autoblocker';
import MockMutationObserver from './_mocks';
import {defaultConfig} from '../src/config';

describe('Content script', () => {

    beforeEach(() => {
        global.MutationObserver = MockMutationObserver;
        chrome.storage.sync.get.yields(defaultConfig);
        new AutoBlocker();
    });

    afterEach(function () {
        chrome.flush();
        sandbox.restore();
    });

    it('It loads user preferences on init', () => {
        sandbox.spy(AutoBlocker, 'loadSettings');
        new AutoBlocker();
        expect(AutoBlocker.loadSettings.calledOnce,
            'loads settings on init').to.be.true;
    });

    it('It reloads preferences on update', () => {
        sandbox.spy(AutoBlocker, 'loadSettings');
        chrome.runtime.onMessage.dispatch({updateSettings: true});
        expect(AutoBlocker.loadSettings.calledOnce,
            'loads settings on init').to.be.true;
    });

    it('Matches keywords', () => {
        expect(AutoBlocker.checkWords(
            ['Serial Entrepreneur'],
            'CEO Keynote Speaker, GoogleDevExpert, MSFT MVP, Serial Entrepreneur, Investor'),
            'plaintext').to.be.true;
        expect(AutoBlocker.checkWords(
            ['micros*'],
            '@Microsoft by day Aspiring to bloom where planted.'),
            'micros* (wildcard)').to.be.true;
        expect(AutoBlocker.checkWords(
            ['\\bmicrosoft*'],
            'Microsoft for Startups provides #cloud services and #software to help #startups grow faster.'),
            '\\bmicrosoft* (wildcard)').to.be.true;
        expect(AutoBlocker.checkWords(
            ['\\bvision'],
            'Entrepreneur | Innovator with a ViSiOn to eliminate diagnostic errors using Artificial Intelligence'),
            '\\bvision (case)').to.be.true;
        expect(AutoBlocker.checkWords(
            ['micros*'],
            'Choose the browser that puts you first. Microsoft Edge is the fast and secure browser that helps you save time and money.'),
            'micros* (wildcard)').to.be.true;

    });
});


