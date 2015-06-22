'use strict'; 'use strong';

import app from '../../../src/Base';
import $injector, {$injectionBinder} from '../../../src/services/$Injector';
import $log from '../../../src/util/$LogProvider';
import $ExceptionsProvider from '../../../src/util/$ExceptionsProvider';

let expect = global.expect,
    mock = global.mock;

describe('$Injector', function() {
    let get;
    describe('$injector', function() {
        beforeEach(function() {
            get = $injector.get;
            mock($ExceptionsProvider, '$$providerError', function() {});
            mock(process, 'exit', function() {});
            app.service('test', 'test');
            app.service('test2', 'test2');
            app.service('$scope', 'test4');
        });
        afterEach(function() {
            app.services = {};
            app.__registry__ = {};
        });
        describe('get', function() {
            it('test get returns nothing if no arguments', function() {
                expect(get()).to.deep.eq([]);
                expect($ExceptionsProvider.$$providerError).to.have.been.called;
                expect(process.exit).to.have.been.called;
            });
            it('test argument not found', function() {
                expect(get('test', 'test2', 'test3')).to.deep.eq([ 'test', 'test2' ]);
                expect($ExceptionsProvider.$$providerError).to.not.have.been.called;
                expect(process.exit).to.have.been.called;
            });
            it('test all arguments found', function() {
                app.service('test3', 'test3');
                expect(
                    get('test', 'test2', 'test3')
                ).to.deep.eq([ 'test', 'test2', 'test3' ]);
                expect($log.warn).to.not.have.been.called;
                expect(process.exit).to.not.have.been.called;
            });
            it('test scope resolves to $scope', function() {
                expect(get('scope')).to.eq('test4');
                expect($ExceptionsProvider.$$providerError).to.not.have.been.called;
                expect(process.exit).to.not.have.been.called;
            });
            it(
                'test a request for a single argument returns a single provision',
                function() {
                    expect(get('test')).to.deep.eq('test');
                    expect(
                        $ExceptionsProvider.$$providerError
                    ).to.not.have.been.called;
                    expect(process.exit).to.not.have.been.called;
                }
            );
        });
    });
    describe('$injectionBinder', function() {
        let args,
            called = false;

        afterEach(function() {
            args = undefined;
            called = false;
        });
        it('test empty args produces no returns', function() {
            $injectionBinder(test);
            expect(args[0]).to.be.null;
            expect(args[1]).to.deep.eq([]);
            expect(called).to.be.true;
        });

        function test() {}
        test.bind = function() {
            args = arguments;
            called = true;
        };
    });
});
