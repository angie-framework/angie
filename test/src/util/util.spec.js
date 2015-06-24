'use strict'; 'use strong';

// Test Modules
import {expect} from    'chai';

// Angie Modules
import util from        '../../../src/util/util';


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
        });
    });
    it('noop', function() {
        expect(util.noop()).to.be.undefined;
    });
});
