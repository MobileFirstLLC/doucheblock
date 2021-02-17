import AutoBlocker from "../src/modules/autoblocker";
import {defaultConfig} from "../src/config";

describe('Content script', () => {

    beforeEach(() => {
        global.MutationObserver = class {
            observe() {
            }
        }
        chrome.storage.sync.get.yields(defaultConfig);
    });

    afterEach(function () {
        chrome.flush();
        sandbox.restore();
    });

    it('It loads user preferences', () => {
        sandbox.spy(AutoBlocker, 'loadSettings')
        const ab = new AutoBlocker(); // init
        expect(AutoBlocker.loadSettings.calledOnce, 'loads settings on init').to.be.true;
    });

});
