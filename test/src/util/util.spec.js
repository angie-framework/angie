'use strict'; 'use strong';

// Test Modules
import {expect} from            'chai';
import simple, {mock} from      'simple-mock';

// Angie Modules
import util from                '../../../src/util/util';

describe('Util', function() {
    describe('removeTrailingLeadingSlashes', function() {
        let slashes;
        beforeEach(function() {
            slashes = util.removeTrailingLeadingSlashes;
        });
        it('test called without any arguments', function() {
            expect(slashes()).to.eq('');
        });
        it('test leading slash', function() {
            expect(slashes('/test')).to.eq('test');
        });
        it('test many leading slashes', function() {
            expect(slashes('//test')).to.eq('/test');
        });
        it('test trailing slash', function() {
            expect(slashes('test/')).to.eq('test');
        });
        it('test many trailing slashes', function() {
            expect(slashes('test//')).to.eq('test/');
        });
        it('test leading & trailing slashes', function() {
            expect(slashes('/test/')).to.eq('test');
        });
        it('test intra-string slashes', function() {
            expect(slashes('t/e/s/t')).to.eq('t/e/s/t');
        });
    });
    describe('toCamel', function() {
        it('test a non-camel string', function() {
            expect(util.toCamel('test-test')).to.eq('testTest');
            expect(util.toCamel('test_test')).to.eq('testTest');
        });
        it('test an uppercase string', function() {
            expect(util.toCamel('TEST-TEST')).to.eq('testTest');
        });
        it('test no special chars', function() {
            expect(util.toCamel('testtest')).to.eq('testtest');
        });
    });
    describe('toUnderscore, toDash', function() {
        beforeEach(function() {
            mock(util, 'toFormat', function() {});
        });
        afterEach(function() {
            simple.restore();
        });
        it('test toUnderscore calls to format', function() {
            util.toUnderscore('test');
            expect(util.toFormat).to.have.been.called;
        });
        it('test toDash calls to format', function() {
            util.toDash('test');
            expect(util.toFormat).to.have.been.called;
        });
    });
    describe('toFormat', function() {
        it(
            'test toFormat properly formats camelCase to underscore_separation',
            function() {
                expect(util.toFormat('testTest', '_')).to.eq('test_test');
            }
        );
        it(
            'test toFormat properly formats camelCase to dash-separation',
            function() {
                expect(util.toFormat('testTest', '-')).to.eq('test-test');
            }
        );
    });
    it('noop', function() {
        expect(util.noop()).to.be.undefined;
    });
});
