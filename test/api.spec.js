import TwitterApi from '../src/modules/twitterApi';
import Storage from '../src/modules/storage';
import {MockXHR} from './_mocks';
import {defaultConfig} from '../src/config';

const csrf = '', bearer = '';

describe('Twitter API', () => {

    beforeEach(() => {
        global.XMLHttpRequest = MockXHR;
        chrome.storage.sync.get.yields(defaultConfig);
    });
    afterEach(function () {
        chrome.flush();
        sandbox.restore();
    });

    it('Parses bio data correctly', done => {
        TwitterApi.getTheBio(['jack'], bearer, csrf,
            ([{id, name, handle, bio}]) => {
                expect(id).to.be.equal('12');
                expect(name).to.be.equal('jack');
                expect(handle).to.be.equal('jack');
                expect(bio).to.be.equal('#bitcoin');
                done();
            });
    });

    it('Handles errors without crash', done => {
        TwitterApi.getTheBio(['error'], bearer, csrf, undefined,
            function () {
                expect(true, 'error callback was called').to.be.true;
                done();
            });
    });

    it('Detects previously blocked', done => {
        TwitterApi.isBlocking('AsoboStudio', bearer, csrf,
            status => {
                expect(status).to.be.true;
                done();
            });
    });

    it('Increments count on block', done => {
        sandbox.spy(Storage, 'incrementCount');
        expect(Storage.incrementCount.calledOnce).to.be.false;
        TwitterApi.doTheBlock('xyz', bearer, csrf);
        setTimeout(_ => {
            expect(Storage.incrementCount.calledOnce).to.be.true;
            done();
        }, 1);
    });

});
