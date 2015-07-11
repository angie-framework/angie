'use strict'; 'use strong';

// Test Modules
import {expect} from                                    'chai';

// Angie Modules
import app from                                         '../../../src/Angular';
import {default as $Injector, $injectionBinder} from    '../../../src/services/$InjectorProvider';
import {$$ProviderNotFoundError} from                   '../../../src/util/$ExceptionsProvider';

describe('$Injector', function() {
    let get;
    describe('$injector', function() {
        beforeEach(function() {
            get = $Injector.get;
            app.constant('test', 'test');
            app.constant('test1', 'test');
            app.service('$scope', 'test');
        });
        afterEach(function() {
            app.constants = {};
            app.services = {};
            app.$registry = {};
        });
        describe('get', function() {
            it('test get returns nothing if no arguments', function() {
                expect(get()).to.deep.eq([]);
            });
            it('test a single argument', function() {
                expect(get('test')).to.eq('test');
            });
            it('test argument not found', function() {
                expect(
                    get.bind(null, 'test', 'test1', 'test2')
                ).to.throw($$ProviderNotFoundError);
            });
            it('test all arguments found', function() {
                app.constant('test3', 'test');
                expect(
                    get('test', 'test1', 'test3')
                ).to.deep.eq([ 'test', 'test', 'test' ]);
            });
            it('test scope resolves to $scope', function() {
                expect(get('scope')).to.eq('test');
            });
            it(
                'test a request for a single argument returns a single provision',
                function() {
                    expect(get('test')).to.deep.eq('test');
                }
            );
            it(
                'test a request for a an array returns two provisions',
                function() {
                    expect(get([ 'test', 'test1' ])).to.deep.eq([ 'test', 'test' ]);
                }
            );
        });
    });
    describe('$injectionBinder', function() {
        let args,
            fn = function() {
                args = arguments;
            };

        beforeEach(() => app.constant('test', 'test').constant('test1', 'test'));
        afterEach(function() {
            app._tearDown('test')._tearDown('test1');
            args = undefined;
        });
        describe('test anonymous function', function() {
            let test = function () {},
                test1 = function(test) { test = test; },
                test2 = function(test, test1) { test = test1 = test1; };
            test.bind = test1.bind = test2.bind = fn;
            it('test empty args produces no returns', function() {
                $injectionBinder(test);
                expect(args[0]).to.be.null;
                expect(args[1]).to.be.undefined;
            });
            it('test arguments with single provider', function() {
                $injectionBinder(test1);
                expect(args[0]).to.be.null;
                expect(args[1]).to.eq('test');
            });
            it('test arguments with many providers', function() {
                $injectionBinder(test2);
                expect(args[0]).to.be.null;
                expect(args[1]).to.eq('test');
                expect(args[2]).to.eq('test');
            });
        });
        describe('test named function', function() {
            function test() {}
            function test1(test) { test = test; }
            function test2(test, test1) { test = test1 = test1; }
            test.bind = test1.bind = test2.bind = fn;
            it('test empty args produces no returns', function() {
                $injectionBinder(test);
                expect(args[0]).to.be.null;
                expect(args[1]).to.be.undefined;
            });
            it('test arguments with single provider', function() {
                $injectionBinder(test1);
                expect(args[0]).to.be.null;
                expect(args[1]).to.eq('test');
            });
            it('test arguments with many providers', function() {
                $injectionBinder(test2);
                expect(args[0]).to.be.null;
                expect(args[1]).to.eq('test');
                expect(args[2]).to.eq('test');
            });
        });
        describe('test arrow function', function() {
            let test = () => null,
                test1 = (test) => test = test,
                test2 = (test, test1) => test = test1 = test1;
            test.bind = test1.bind = test2.bind = fn;
            it('test empty args produces no returns', function() {
                $injectionBinder(test);
                expect(args[0]).to.be.null;
                expect(args[1]).to.be.undefined;
            });
            it('test arguments with single provider', function() {
                $injectionBinder(test1);
                expect(args[0]).to.be.null;
                expect(args[1]).to.eq('test');
            });
            it('test arguments with many providers', function() {
                $injectionBinder(test2);
                expect(args[0]).to.be.null;
                expect(args[1]).to.eq('test');
                expect(args[2]).to.eq('test');
            });
        });
    });
});
