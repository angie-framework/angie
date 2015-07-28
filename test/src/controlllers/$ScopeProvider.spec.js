'use strict'; 'use strong';

// System Modules
import {expect} from        'chai';
import simple, {mock} from          'simple-mock';

// Angie Modules
import $ScopeProvider, {
    $scope
} from                      '../../../src/controllers/$ScopeProvider';

describe('$ScopeProvider', function() {
    let $$scope;

    beforeEach(function() {
        $$scope = new $ScopeProvider();
    });
    it('constructor', function() {
        console.log($$scope);
        expect($$scope.$$id).to.eq(1);
    });
    describe('$on', function() {
        afterEach(function() {
            $scope.$$handlers([]);
        });
        it('test called with function', function() {
            console.log($scope);
            expect($scope.$on('test', () => undefined)).to.be.true;
            let handlers = $scope.$$handlers();
            expect(handlers.length).to.eq(1);
            expect(handlers[0]).to.be.a.function;
        });
        it('test called with an object', function() {
            console.log($scope);
            expect($scope.$on('test', {})).to.be.false;
            expect($scope.$$handlers().length).to.eq(0);
        });
    });
    describe('$broadcast', function() {
        let testSpy,
            notSpy;

        beforeEach(function() {
            mock(global, 'setImmediate', (fn) => fn());
            $scope.$$handlers([
                {
                    'test': (testSpy = simple.spy())
                },
                {
                    'not': (notSpy = simple.spy())
                }
            ]);
        });
        afterEach(function() {
            simple.restore();
            $scope.$$handlers([]);
        });
        it('test not async', function() {
            $scope.$broadcast('test');
            expect(global.setImmediate).to.not.have.been.called;
            expect(testSpy).to.have.been.called;
            expect(notSpy).to.not.have.been.called;
        });
        it('test async', function() {
            $scope.$broadcast('test', true);
            expect(global.setImmediate).to.have.been.called;
            expect(testSpy).to.have.been.called;
            expect(notSpy).to.not.have.been.called;
        });
    });
    describe('$watch', function() {
        beforeEach(function() {
            mock(Object, 'observe', (obj) => obj);
        });
        afterEach(function() {
            simple.restore();
        });
        it('set $watcher from $$scope', function() {
            $$scope.test = 'test';
            $$scope.$watch('test', () => undefined);
            expect(Object.observe.calls[0].args[0]).to.eq('test');
            expect(Object.observe.calls[0].args[1]).to.be.a.function;
        });
    });
    describe('$$off', function() {
        beforeEach(function() {
            mock(global, 'setImmediate', (fn) => fn());
            $scope.$$handlers([
                {
                    'test': () => undefined
                },
                {
                    'not': () => undefined
                }
            ]);
        });
        afterEach(function() {
            simple.restore();
            $scope.$$handlers([]);
        });
        it('test remove handler', function() {
            expect($scope.$$off('test')).to.be.true;
            let handlers = $scope.$$handlers();
            expect(handlers.length).to.eq(1);
            expect(Object.keys(handlers[0])[0]).to.eq('not');
        });
    });
});