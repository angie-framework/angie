// Test Modules
import { expect, assert } from      'chai';
import simple, { mock } from        'simple-mock';

// System Modules
import $LogProvider from            'angie-log';

// Angie Modules
import $compile from                '../../../src/factories/$Compile';

const TEST_ENV =                    global.TEST_ENV || 'src',
    $$ngieRepeatFactory =           require(`../../../${TEST_ENV}/directives/ngie-repeat`),
    trim = s => s.toString().replace(/(\s){2,}|\n/g, '');

describe('$$ngieRepeatFactory', function() {
    it('test $$ngieRepeatFactory returns', function() {
        let obj = $$ngieRepeatFactory();
        expect(obj.priority).to.eq(1);
        expect(obj.restrict).to.eq('AECM');
        expect(obj.link).to.be.a.function;
    });
    describe('link', function() {
        let template,
            templateFn,
            scope;

        beforeEach(function() {
            template = trim`
                <div>
                    <div class="test" ngie-repeat="for v of test">
                        {{test}}
                    </div>
                </div>
            `;
            templateFn = $compile(template);
            scope = {
                test: [ 1, 2, 3 ],
                test1: { 1: 1, 2: 2, 3: 3 }
            };
            mock($LogProvider, 'warn', () => false);
        });
        it('test no root element parent in ngieRepeat statement', function() {
            $compile(trim`
                <div class="test" ngie-repeat="v of test">
                    {{test}}
                </div>
            `)(scope).then(function(t) {
                expect(t).to.be.falsy;
                expect(
                    $LogProvider.warn.calls[0].args[0]
                ).to.eq('Parent DOM element of ngieRepeat element must exist');
            });
        });
        it('test no "for" in ngieRepeat statement', function() {
            $compile(trim`
                <div>
                    <div class="test" ngie-repeat="v of test">
                        {{test}}
                    </div>
                </div>
            `)(scope).then(function(t) {
                expect(t).to.eq('<div></div>');
                expect(
                    $LogProvider.warn.calls[0].args[0]
                ).to.eq('No declared "for" in ngieRepeat directive');
            });
        });
        it('test no $scope found in ngieRepeat statement', function() {
            $compile(trim`
                <div>
                    <div class="test" ngie-repeat="for v of">
                        {{test}}
                    </div>
                </div>
            `)(scope).then(function(t) {
                expect(t).to.eq('<div></div>');
                expect(
                    $LogProvider.warn.calls[0].args[0]
                ).to.eq('No $scope found for ngieRepeat iterable');
            });
        });
        it('test no k,v found in ngieRepeat statement', function() {
            $compile(trim`
                <div>
                    <div class="test" ngie-repeat="for of test">
                        {{test}}
                    </div>
                </div>
            `)(scope).then(function(t) {
                expect(t).to.eq('<div></div>');
                expect(
                    $LogProvider.warn.calls[0].args[0]
                ).to.eq(
                    'No key or value declarations for ngieRepeat to iterate over'
                );
            });
        });
        it('test no iterator keyword found in ngieRepeat statement', function() {
            $compile(trim`
                <div>
                    <div class="test" ngie-repeat="for k,v test">
                        {{test}}
                    </div>
                </div>
            `)(scope).then(function(t) {
                expect(t).to.eq('<div></div>');
                expect(
                    $LogProvider.warn.calls[0].args[0]
                ).to.eq(
                    'Use the keyword "in" or "of" in ngieRepeat declarations'
                );
            });
        });
        it('test successful k "in" keyword ngieRepeat iterator', function() {
            $compile(trim`
                <div>
                    <div class="test" ngie-repeat="for k,v in test1">
                        {{k}}
                    </div>
                </div>
            `)(scope).then(function(t) {
                expect(t).to.eq(trim`
                    <div>
                        <div class="test">1</div>
                        <div class="test">2</div>
                        <div class="test">3</div>
                    </div>
                `);
                assert(!$LogProvider.warn.called);
            });
        });
        it('test successful v "in" keyword ngieRepeat iterator', function() {
            $compile(trim`
                <div>
                    <div class="test" ngie-repeat="for k,v in test1">
                        {{v}}
                    </div>
                </div>
            `)(scope).then(function(t) {
                expect(t).to.eq(trim`
                    <div>
                        <div class="test">1</div>
                        <div class="test">2</div>
                        <div class="test">3</div>
                    </div>
                `);
                assert(!$LogProvider.warn.called);
            });
        });
        it('test successful k,v "in" keyword ngieRepeat iterator', function() {
            $compile(trim`
                <div>
                    <div class="test" ngie-repeat="for k,v in test1">
                        {{k}}{{v}}
                    </div>
                </div>
            `)(scope).then(function(t) {
                expect(t).to.eq(trim`
                    <div>
                        <div class="test">11</div>
                        <div class="test">22</div>
                        <div class="test">33</div>
                    </div>
                `);
                assert(!$LogProvider.warn.called);
            });
        });
        it('test successful k,v "of" keyword ngieRepeat iterator', function() {
            $compile(trim`
                <div>
                    <div class="test" ngie-repeat="for v of test">
                        {{v}}
                    </div>
                </div>
            `)(scope).then(function(t) {
                expect(t).to.eq(trim`
                    <div>
                        <div class="test">1</div>
                        <div class="test">2</div>
                        <div class="test">3</div>
                    </div>
                `);
                assert(!$LogProvider.warn.called);
            });
        });
        it('test successful k,v "of" keyword ngieRepeat iterator', function() {

            // The expected response of this iteration is probably not what The
            // user expects...nevertheless...
            $compile(trim`
                <div>
                    <div class="test" ngie-repeat="for k,v of test">
                        {{k}},{{v}}
                    </div>
                </div>
            `)(scope).then(function(t) {
                expect(t).to.eq(trim`
                    <div>
                        <div class="test">0,1</div>
                        <div class="test">1,2</div>
                        <div class="test">2,3</div>
                    </div>
                `);
                assert(!$LogProvider.warn.called);
            });
        });
    });
});