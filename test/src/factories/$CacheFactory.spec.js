// System Modules
import { expect } from  'chai';

// Angie Modules
const TEST_ENV =        global.TEST_ENV || 'src',
    $cacheFactory =     require(`../../../${TEST_ENV}/factories/$CacheFactory`);

describe('$CacheFactory', function() {
    let cache;

    beforeEach(function() {
        cache = new $cacheFactory('test');
    });
    afterEach(function() {
        cache.delete();
    });
    describe('constructor', function() {
        it('test constructor instantiates cache', function() {
            expect(cache.key).to.eq('test');
            expect(cache.cache).to.deep.eq({});
        });
        it('test constructor assigns previously existing cache', function() {
            new $cacheFactory('test').put('test', 'test');

            let cache = new $cacheFactory('test');
            expect(cache.cache).to.deep.eq({ test: 'test' });
        });
    });
    describe('put', function() {
        it('test not previously existing cache id', function() {
            expect(
                cache.put('test', 'test').get('test')
            ).to.eq('test');
        });
        it('test previously existing cache id, no replace', function() {
            expect(
                cache.put('test', 'test').put('test', 'test1').get('test')
            ).to.eq('test');
        });
        it('test previously existing cache id, replace', function() {
            expect(
                cache.put('test', 'test').put('test', 'test1', true).get('test')
            ).to.eq('test1');
        });
    });
    describe('get', function() {
        it('test get where cache id is not defined', function() {
            expect(cache.get('test')).to.be.undefined;
        });
        it('test get where cache id is defined', function() {
            expect(cache.put('test', 'test').get('test')).to.eq('test');
        });
    });
});
