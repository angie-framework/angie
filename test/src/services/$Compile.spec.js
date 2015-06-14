'use strict'; 'use strong';

import app from '../../../src/Base';
import $compile from '../../../src/services/$Compile';
import $log from '../../../src/util/$LogProvider';

describe('$compile', function() {
    it(
        'test compile called without a template returns an empty function',
        function() {
            expect($compile()).to.eq(angular.noop);
            expect($compile('')).to.eq(angular.noop);
        }
    );
    it('test compile returns a function', function() {
        expect($compile('test')).to.be.a('function');
    });
    describe('template listeners', function() {
        let scope;

        beforeEach(function() {
            mock($log, 'warn', function() {});
            scope = {
                test: 'test',
                test1: 'test1',
                test2: 'test2',
                test4: {
                    test: 'test4'
                },
                test5: 20,
                test6: 5
            };
        });
        it('test no listeners', function() {
            expect($compile('test')(scope)).to.eq('test');
        });

        it('test listener with no matches', function() {
            expect($compile('{{{test3}}}')(scope)).to.eq('');
            expect($log.warn).to.have.been.called;
        });
        it('test _templateCompile evaluates a single matched listener', function() {
            console.log(scope);
            expect($compile('{{{test}}}')(scope)).to.eq('test');
        });
        it('test _templateCompile evaluates multiple matched listeners', function() {
            expect($compile('{{{test}}} {{{test1}}} {{{test2}}}')(scope)).to.eq(
                'test test1 test2'
            );
        });
        it('test _templateCompile evaluates deep listeners', function() {
            expect($compile('{{{test4.test}}}')(scope)).to.eq('test4');
        });
        it('test listener with abnormal spacing', function() {
            expect($compile('{{{       test       }}}')(scope)).to.eq('test');
            expect(
                $compile('        {{{    test4.    test     }}}')(scope)
            ).to.eq('        test4');
        });
        it('test _templateCompile evaluates functional expressions', function() {
            expect(
                $compile('{{{test4.test.indexOf(\'test1\') > -1}}}')(scope)
            ).to.eq('false');
            expect(
                $compile('{{{[ test, test1 ].join(\' & \')}}}')(scope)
            ).to.eq('test & test1');
            expect(
                $compile('{{{test.toUpperCase()}}}')(scope)
            ).to.eq('TEST');
        });
        it ('test _templateCompile evaluates binary expressions', function() {
            expect($compile('{{{test5}}}')(scope)).to.eq('20');
            expect($compile('{{{test5 * test6}}}')(scope)).to.eq('100');
            expect($compile('{{{test5 / test6}}}')(scope)).to.eq('4');
            expect($compile('{{{test5 + test6}}}')(scope)).to.eq('25');
            expect($compile('{{{test5 - test6}}}')(scope)).to.eq('15');
            expect($compile('{{{(test5 + test6) * test6}}}')(scope)).to.eq('125');
        });
    });
});
