// Test Modules
import { expect } from              'chai';
import simple, { mock } from        'simple-mock';

// Angie Modules
import $compile from                '../../../src/factories/$Compile';

const TEST_ENV =                    global.TEST_ENV || 'src',
    $$ngieIfFactory =               require(`../../../${TEST_ENV}/directives/ngie-if`);

describe('$$ngieIfFactory', function() {
    it('test $$ngieIfFactory returns', function() {
        let obj = $$ngieIfFactory();
        expect(obj.priority).to.eq(1);
        expect(obj.restrict).to.eq('A');
        expect(obj.link).to.be.a.function;
    });
    describe('link', function() {
        let template,
            templateFn,
            scope;

        beforeEach(function() {
            template = '<div><div class="test" ngie-if="test"></div></div>';
            templateFn = $compile(template);
            scope = { test: true };
        });
        it('test condition found in link, attr removed', function() {
            templateFn(scope).then(function(t) {
                expect(t).to.eq('<div><div class="test"></div></div>');
            });
        });
        it('test condition found in link, attr removed, content', function() {
            $compile(
                '<div><div class="test" ngie-if="test">test</div></div>'
            )(scope).then(function(t) {
                expect(t).to.eq('<div><div class="test">test</div></div>');
            });
        });
        it('test condition found in link, attr removed, scope content',
            function() {
                scope.test1 = 'test';
                $compile(
                    '<div><div class="test" ngie-if="test">{{test1}}</div></div>'
                )(scope).then(function(t) {
                    expect(t).to.eq('<div><div class="test">test</div></div>');
                });
            }
        );
        it('test condition not found, element removed', function() {
            delete scope.test;
            templateFn(scope).then(function(t) {
                expect(t).to.eq('<div></div>');
            });
        });
        it('test condition false, element removed', function() {
            scope.test = false;
            templateFn(scope).then(function(t) {
                expect(t).to.eq('<div></div>');
            });
        });
        it('test condition false, element removed, content', function() {
            scope.test = false;
            $compile(
                '<div><div class="test" ngie-if="test">test</div></div>'
            )(scope).then(function(t) {
                expect(t).to.eq('<div></div>');
            });
        });
        it('test condition false, element removed, content', function() {
            scope.test1 = 'test';
            scope.test = false;
            $compile(
                '<div><div class="test" ngie-if="test">{{test`}}</div></div>'
            )(scope).then(function(t) {
                expect(t).to.eq('<div></div>');
            });
        });
    });
});