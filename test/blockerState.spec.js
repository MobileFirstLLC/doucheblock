import BlockerState from '../src/modules/blockerState';
import {defaultConfig} from '../src/config';

describe('BlockerState', () => {

    beforeEach(() => {
        chrome.storage.sync.get.yields(defaultConfig);
    });

    afterEach(function () {
        chrome.flush();
        sandbox.restore();
        BlockerState.pendingQueue.clear();
        BlockerState.handledList.clear();

    });

    it('PendingQueue contains added values', () => {
        expect(BlockerState.pendingQueue.isEmpty, 'initially empty').to.be.true;
        BlockerState.pendingQueue.add('handle1');
        BlockerState.pendingQueue.addAll(['handle2', 'handle3']);
        expect(BlockerState.pendingQueue.inQueue('handle1')).to.be.true;
        expect(BlockerState.pendingQueue.inQueue('handle2')).to.be.true;
        expect(BlockerState.pendingQueue.inQueue('handle3')).to.be.true;
    });

    it('PendingQueue contains expected values after takeNext()', () => {
        const initial = ['a', 'b', 'c', 'd', 'e'];
        BlockerState.pendingQueue.addAll(initial);
        const result = BlockerState.pendingQueue.takeNext();
        const remaining = BlockerState.pendingQueue.queue;
        expect(result.length + remaining.length).to.be.equal(initial.length);
    });

    it('HandledList contains expected values', () => {
        expect(BlockerState.handledList.list.length, 'list is empty').to.equal(0);
        BlockerState.handledList.add(['handle1', 'handle2', 'handle3']);
        expect(BlockerState.handledList.isChecked('handle1')).to.be.true;
        expect(BlockerState.handledList.isChecked('handle2')).to.be.true;
        expect(BlockerState.handledList.isChecked('handle3')).to.be.true;
        BlockerState.handledList.remove(['handle1', 'handle3']);
        expect(BlockerState.handledList.isChecked('handle1')).to.be.false;
        expect(BlockerState.handledList.isChecked('handle2')).to.be.true;
        expect(BlockerState.handledList.isChecked('handle3')).to.be.false;
    });

    it('Whitelist contains expected values', () => {
        const initial = {1: 'a', 2: 'b'};
        chrome.storage.sync.get.yields({...defaultConfig, whiteList: initial});
        expect(Object.keys(BlockerState.whiteList.whiteList).length, 'list is empty').to.equal(0);
        BlockerState.whiteList.whiteList = {1: 'a', 2: 'b'};
        expect(Object.keys(BlockerState.whiteList.whiteList).length, 'initialized correctly').to.equal(2);
        BlockerState.whiteList.add(3, 'c');
        expect(BlockerState.whiteList.contains(1), 'id 1').to.be.true;
        expect(BlockerState.whiteList.contains(2), 'id 2').to.be.true;
        expect(BlockerState.whiteList.contains(3), 'id 3').to.be.true;
    });

});

