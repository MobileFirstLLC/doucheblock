import Help from '../src/pages/help';

const fs = require('fs');
const path = require('path');

const HTMLTemplate = fs.readFileSync(path.resolve(__dirname,
    '../src/pages/help.html'), 'utf8');

describe('Help page', () => {

    beforeEach(() => {
        document.documentElement.innerHTML = HTMLTemplate;
        new Help();
    });

    afterEach(function () {
        chrome.flush();
        sandbox.restore();
    });

    it('On exit it returns to previous page', () => {
        const stub = sandbox.stub(window.history, 'back');
        expect(stub.notCalled).to.be.true;
        Help.backButton.onclick();
        expect(stub.calledOnce).to.be.true;
    });

});
