// Test Modules
import { expect } from              'chai';
import simple, { mock } from        'simple-mock';

// Angie Modules
import $compile from                '../../../src/factories/$Compile';

const TEST_ENV =                    global.TEST_ENV || 'src',
    $$ngieIgnoreFactory =               require(`../../../${TEST_ENV}/directives/ngie-ignore`);

describe('$$ngieIgnoreFactory', function() {
    it('test $$ngieIgnoreFactory returns', function() {
        let obj = $$ngieIgnoreFactory();
        expect(obj.priority).to.eq(1);
        expect(obj.restrict).to.eq('AECM');
        expect(obj.link).to.be.a.function;
    });
    describe('link', function() {
        it('test template strings ignored inside of ngie-ignore', function() {
            $compile(
                '<div><div class="test" ngie-ignore>{{test}}</div>{{test}}</div>'
            )({
                test: 'test'
            }).then(function(t) {
                expect(t).to.eq(
                    '<div><div class="test">{{test}}</div>test</div>'
                );
            });
        });
    });
});