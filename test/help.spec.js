import Help from '../src/pages/help';

const fs = require('fs');
const path = require('path');
const {location} = window;

const HTMLTemplate = fs.readFileSync(path.resolve(__dirname,
    '../src/pages/help.html'), 'utf8');

describe('Help page', () => {

    beforeEach(() => {
        document.documentElement.innerHTML = HTMLTemplate;
        delete window.location;
        window.location = {assign: sinon.spy()};
        new Help();
    });

    afterEach(function () {
        chrome.flush();
        sandbox.restore();
        window.location.assign.resetHistory();
    });

    after(() => {
        window.location = location;
    });

    it('On exit it returns to previous page', () => {
        expect(window.location.assign.notCalled).to.be.true;
        Help.backButton.onclick();
        expect(window.location.assign.calledOnce).to.be.true;
    });

});
