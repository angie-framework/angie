'use strict'; 'use strong';

import util from '../../../src/util/util';

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
});
