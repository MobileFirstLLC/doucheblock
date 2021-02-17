import OnInstall from "../src/modules/onInstall";
import BrowserAction from "../src/modules/browserAction";
import Tokens from "../src/modules/tokens";

describe('Background script', () => {

    beforeEach(() => {

    });

    afterEach(function () {
        chrome.flush();
        sandbox.restore();
    });

    it('loads without error', () => {
        expect(() => new OnInstall()).to.not.throw();
        expect(() => new BrowserAction()).to.not.throw();
        expect(() => new Tokens()).to.not.throw();
    });

});
