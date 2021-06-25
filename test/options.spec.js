const fs = require('fs')
const path = require('path')
import OptionPage from '../src/pages/index';

// read the page template
const HTMLTemplate = fs.readFileSync(path.resolve(__dirname, '../src/pages/index.html'), 'utf8');

describe('Options page', () => {

    beforeEach(() => {
        document.documentElement.innerHTML = HTMLTemplate;
    });

    afterEach(function () {
        chrome.flush();
        sandbox.restore();
    });

    it('It loads user preferences', () => {
        // call on init
        sandbox.spy(OptionPage, 'loadSettings')
        const opt = new OptionPage();
        expect(OptionPage.loadSettings.calledOnce,
            'loads settings on init').to.be.true;
    });

});
