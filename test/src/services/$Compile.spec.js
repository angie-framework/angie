'use strict'; 'use strong';

import {expect} from    'chai';
import simple, {mock} from      'simple-mock';

import app, {angular} from     '../../../src/Angular';
import $compile from    '../../../src/services/$Compile';
import $log from        '../../../src/util/$LogProvider';

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
            mock(Promise, 'all', function() {
                return {
                    then: (fn) => fn()
                };
            });
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
        afterEach(() => simple.restore());
        it('test no listeners', function() {
            expect($compile('test')(scope)).to.eq('test');
        });

        it('test listener with no matches', function() {
            expect($compile('{{{test3}}}')(scope)).to.eq('');
            expect($log.warn).to.have.been.called;
        });
        it('test _templateCompile evaluates a single matched listener', function() {
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
            ).to.eq('test4');
        });
        it('test _templateCompile evaluates functional expressions', function() {
            expect(
                $compile('{{{test4.test.indexOf(\'test1\') > -1}}}')(scope)
            ).to.eq('false');
            expect(
                $compile('{{{[ test, test1 ].join(\' & \')}}}')(scope)
            ).to.eq('test &amp; test1');
            expect(
                $compile('{{{test.toUpperCase()}}}')(scope)
            ).to.eq('TEST');
        });
        it('test _templateCompile evaluates binary expressions', function() {
            expect($compile('{{{test5}}}')(scope)).to.eq('20');
            expect($compile('{{{test5 * test6}}}')(scope)).to.eq('100');
            expect($compile('{{{test5 / test6}}}')(scope)).to.eq('4');
            expect($compile('{{{test5 + test6}}}')(scope)).to.eq('25');
            expect($compile('{{{test5 - test6}}}')(scope)).to.eq('15');
            expect($compile('{{{(test5 + test6) * test6}}}')(scope)).to.eq('125');
        });
    });
    describe('directive compilation', function() {
        let _Promise;
        beforeEach(function() {
            _Promise = global.Promise;
            global.Promise = class Promise {
                constructor(fn) {
                    if (typeof fn === 'function') {
                        fn(angular.noop);
                    }
                }
                then(fn) {
                    let val = fn(this.val);
                    this.val = val;
                    return this;
                }
                static all(proms) {
                    proms.forEach(function(prom) {
                        if (typeof prom === 'function') {
                            prom();
                        }
                    });
                    return new Promise();
                }
            };
            app.directive('testDir', {
                restrict: 'C',
                Controller: 'test',
                link: function(scope, el, attrs, done) {
                    attrs.test = 'test';
                    done();
                }
            });
        });
        afterEach(function() {
            global.Promise = _Promise;
            app._tearDown('testDir');
        });
        it('test attribute unmatched directive', function() {
            $compile('<div test-dir></div>')({}).then(function(t) {
                expect(t).to.eq('<div test-dir=""></div>');
            });
        });
        it('test attribute matched directive', function() {
            app.directives.testDir.restrict = 'A';
            $compile('<div test-dir></div>')({}).then(function(t) {
                expect(t).to.eq('<div test-dir="" test="test"></div>');
            });
        });
        it('test element matched directive', function() {
            app.directives.testDir.restrict = 'E';
            $compile('<test-dir></test-dir>')({}).then(function(t) {
                expect(t).to.eq('<test-dir test="test"></test-dir>');
            });
        });
        it('test class matched directive', function() {
            $compile('<div class="testDir"></div>')({}).then(function(t) {
                expect(t).to.eq('<div class="testDir" test="test"></div>');
            });
        });
        it('test entire matched document', function() {
            $compile(
                '<!DOCTYPE html><html><head></head><body><div class="testDir"></div>' +
                '</body></html>'
            )({}).then(function(t) {
                expect(t).to.eq(
                    '<!DOCTYPE html>\n<html><head></head><body>' +
                    '<div class="testDir" test="test"></div></body></html>'
                );
            });
        });
        it('test directive replace', function() {
            app.directives.testDir.replace = true;
            app.directives.testDir.link = function(s, e) {
                e.innerHTML = 'blah';
            };
            $compile('<div class="testDir"></div>')({}).then(function(t) {
                expect(t).to.eq('blah');
            });
        });
        it('test no directive link function', function() {
            delete app.directives.testDir.link;
            $compile('<div class="testDir"></div>')({}).then(function(t) {
                expect(t).to.eq('<div class="testDir"></div>');
            });
        });
        // it('test directive template', function() {
        //     delete app.directives.testDir.link;
        //     app.directives.testDir.template = 'blah';
        //     $compile('<div class="testDir"></div>')({}).then(function(t) {
        //         expect(t).to.eq('<div class="testDir">blah</div>');
        //     });
        // });
    });
});

// Test all directive keywords  (template) (templatePath) (prepend) (nested parser property)
// TODO test $window, $document
// TODO test directive with attribute the same as name
