'use strict';

import app from '../../../src/Base';
import compile from '../../../src/services/$Compile';

describe('$Compile', function() {
    it(
        'test compile called without a template returns an empty function',
        function() {
            expect(compile()).to.eq(angular.noop);
            expect(compile('')).to.eq(angular.noop);
        }
    );
    it('test compile returns a function', function() {
        expect(compile('test')).to.be.a('function');
    });

    // TODO this will have to be modified when you are listening inside a
    // template
    describe('template listeners', function() {
        let scope;

        beforeEach(function() {
            scope = {
                test: 'test',
                test1: 'test1',
                test2: 'test2'
            };
        });
        it('test no listeners', function() {
            expect(compile('test')(scope)).to.eq('test');
        });
        it('test listener with no matches', function() {
            expect(compile('{{{test3}}}')(scope)).to.eq('')
        });
        it('test templateCompile evaluates a single matched listener', function() {
            expect(compile('{{{test}}}')(scope)).to.eq('test');
        });
        it('test templateCompile evaluates multiple matched listeners', function() {
            expect(compile('{{{test}}} {{{test1}}} {{{test2}}}')(scope)).to.eq(
                'test test1 test2'
            );
        });
    });
});
