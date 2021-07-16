import OnInstall from '../src/modules/onInstall';
import BrowserAction from '../src/modules/browserAction';
import Tokens from '../src/modules/tokens';
import Tabs from '../src/modules/tabs';
import {OnInstallURL, OptionsPageURL} from '../src/config';

describe('Background script', () => {

    beforeEach(() => {
        chrome.storage.sync.get.yields({count: 0});
        // setup the background context
        new OnInstall();
        new BrowserAction();
        new Tokens();
    });

    afterEach(function () {
        chrome.flush();
        sandbox.restore();
        Tokens.csrfToken = undefined;
        Tokens.bearerToken = undefined;
    });

    it('Options page opens on install', done => {
        expect(chrome.tabs.create.notCalled).to.be.true;
        chrome.runtime.onInstalled.dispatch({reason: 'install'});
        expect(chrome.tabs.create.withArgs({url: OnInstallURL}).calledOnce).to.be.true;
        done();
    });

    it('Options page does not open on upgrade', done => {
        expect(chrome.tabs.create.notCalled).to.be.true;
        chrome.runtime.onInstalled.dispatch({reason: 'upgrade'});
        expect(chrome.tabs.create.notCalled).to.be.true;
        done();
    });

    it('Browser action opens options page', done => {
        expect(chrome.tabs.create.notCalled).to.be.true;
        chrome.browserAction.onClicked.dispatch();
        expect(chrome.tabs.create.withArgs({url: OptionsPageURL}).calledOnce).to.be.true;
        done();
    });

    it('Does not display badge when count is 0', done => {
        chrome.storage.sync.get.yields({count: 0});
        expect(chrome.browserAction.setBadgeText.notCalled).to.be.true;
        chrome.runtime.onMessage.dispatch({increment: true});
        expect(chrome.browserAction.setBadgeText.notCalled).to.be.true;
        done();
    });

    it('Requesting increment updates badge to stored count', done => {
        chrome.storage.sync.get.yields({count: 10});
        chrome.runtime.onMessage.dispatch({increment: true});
        expect(chrome.browserAction.setBadgeText.withArgs({text: '10'}).called).to.be.true;
        done();
    });

    it('Converts long numbers to more compact form', done => {
        expect(BrowserAction.formatBadgeCount(1)).to.equal('1');
        expect(BrowserAction.formatBadgeCount(10)).to.equal('10');
        expect(BrowserAction.formatBadgeCount(100)).to.equal('100');
        expect(BrowserAction.formatBadgeCount(9999)).to.equal('9999');
        expect(BrowserAction.formatBadgeCount(1000)).to.equal('1000');
        expect(BrowserAction.formatBadgeCount(10000)).to.equal('10K');
        expect(BrowserAction.formatBadgeCount(100000)).to.equal('100K');
        done();
    });

    it('Notifies tabs of settings update', () => {
        chrome.tabs.query.yields([{id: 1}, {id: 2}]);
        Tabs.notifyTabsOfUpdate();
        expect(chrome.tabs.sendMessage.calledTwice, 'sends message').to.be.true;
    });

    it('Ignores bad request headers', () => {
        // bad request headers
        Tokens.getTheTokens({requestHeaders: undefined});
        let csrf = Tokens.csrfToken;
        let bearer = Tokens.bearerToken;
        expect(bearer, 'no bearer after bad request').to.equal(undefined);
        expect(csrf, 'no csrf after bad request').to.equal(undefined);
    });

    it('Finds bearer and csrf from request headers', () => {
        // good request headers
        Tokens.getTheTokens({
            requestHeaders:
                JSON.parse('[' +
                    '{"name":"x-twitter-client-language","value":"en"},' +
                    '{"name":"x-csrf-token","value":"csrf"},' +
                    '{"name":"sec-ch-ua-mobile","value":"?0"},' +
                    '{"name":"authorization","value":"bearer"},' +
                    '{"name":"content-type","value":"application/x-www-form-urlencoded"},' +
                    '{"name":"Accept","value":"*/*"},' +
                    '{"name":"User-Agent","value":"Mozilla/5.0"},' +
                    '{"name":"x-twitter-auth-type","value":"OAuth2Session"},' +
                    '{"name":"x-twitter-active-user","value":"yes"}' +
                    ']')
        });
        const csrf = Tokens.csrfToken;
        const bearer = Tokens.bearerToken;
        expect(bearer, 'bearer found after good headers').to.equal('bearer');
        expect(csrf, 'csrf found after good headers').to.equal('csrf');
    });

    it('Returns bearer and csrf on request', () => {
        Tokens.bearerToken = 'bearer';
        Tokens.csrfToken = 'csrf';
        chrome.runtime.onMessage.dispatch({notTokens: true}, {}, resp => (
            expect(resp.bearer, 'ignores').to.equal(undefined) &&
            expect(resp.csrf, 'ignores').to.equal(undefined)
        ));
        chrome.runtime.onMessage.dispatch({tokens: true}, {}, resp => (
            expect(resp.bearer, 'get bearer').to.equal('bearer') &&
            expect(resp.csrf, 'get csrf').to.equal('csrf')
        ));
    });

});
