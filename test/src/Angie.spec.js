// Test Modules
import { expect, assert } from      'chai';
import simple, { mock } from        'simple-mock';

// System Modules
import fs from                      'fs';
import $LogProvider from            'angie-log';

// Angie Modules
const TEST_ENV =                    global.TEST_ENV || 'src',
    Angie =                         require(`../../${TEST_ENV}/Angie`).Angie,
    CWD = process.cwd();

describe('Angie', function() {
    let noop = () => undefined,
        app;

    beforeEach(function() {
        app = new Angie();
    });
    describe('constructor', function() {
        it('test constructor properly instantiates app properties', function() {
            expect(app.constants).to.deep.eq({});
            expect(app.configs).to.deep.eq([]);
            expect(app.services).to.deep.eq({});
            expect(app.Controllers).to.deep.eq({});
            expect(app.directives).to.deep.eq({});
            expect(app.$$registry).to.deep.eq({});
            expect(app.$dependencies).to.deep.eq([]);
        });
    });
    describe('$$register', function() {
        beforeEach(function() {
            mock($LogProvider, 'warn', noop);
        });
        it('test $register returns the app object', function() {
            expect(app.$$register()).to.deep.eq(app);
        });
        it('test $register called without a name fails', function() {
            app.$$register('directives', null, {});
            expect(app.$$registry).to.deep.eq({});
            expect(app.directives).to.deep.eq({});
            expect($LogProvider.warn).to.have.been.called;
        });
        it('test $register called without an obj fails', function() {
            app.$$register('directives', 'test', null);
            expect(app.$$registry).to.deep.eq({});
            expect(app.directives).to.deep.eq({});
            expect($LogProvider.warn).to.have.been.called;
        });
        it('test $register properly $registers a provider', function() {
            app.$$register('directives', 'test', 'test');
            expect(app.$$registry.test).to.eq('directives');
            expect(app.directives.test).to.deep.eq('test');
        });
    });
    describe('directive', function() {
        beforeEach(function() {
            mock(app, '$$register', noop);
        });
        it('test Controller and string type', function() {
            let obj = {
                Controller: 'test'
            };
            app.directive('test', function() {
                return obj;
            });
            expect(app.$$register.calls[0].args).to.deep.eq(
                [ 'directives', 'test', obj ]
            );
        });
        it('test throws error if Controller not string type', function() {
            let obj = {
                Controller: noop
            };
            expect(app.directive.bind(null, 'test', () => obj));
            assert(!app.$$register.called);
        });
        it(
            'test $Exceptions called when there is a not controller and ' +
            'directive is an API View',
            function() {
                expect(app.directive.bind(null, 'test', function() {
                    return {
                        type: 'APIView'
                    };
                })).to.throw();
            }
        );
    });
    describe('constant, service, factory, Controller', function() {
        beforeEach(function() {
            mock(app, '$$register', noop);
        });
        it('test constant makes a call to $$register', function() {
            app.constant('test', 'test');
            expect(app.$$register.calls[0].args).to.deep.eq([
                'constants',
                'test',
                'test'
            ]);
        });
        describe('test service makes a call to $$register', function() {
            it('test object', function() {
                app.service('test', { test: 'test' });
                expect(app.$$register.calls[0].args).to.deep.eq([
                    'services',
                    'test',
                    { test: 'test' }
                ]);
            });
            it('test function', function() {
                expect(
                    app.service.bind(null, 'test', function test() {})
                ).to.throw();
            });
            it('test string', function() {
                expect(
                    app.service.bind(null, 'test', 'test')
                ).to.throw();
            });
        });
        describe('test factory makes a call to $$register', function() {
            it('test object', function() {
                expect(
                    app.factory.bind(null, 'test', { test: 'test' })
                ).to.throw();
            });
            it('test function', function() {
                let test = function() {};
                app.factory('test', test);
                expect(app.$$register.calls[0].args).to.deep.eq([
                    'factories',
                    'test',
                    test
                ]);
            });
            it('test string', function() {
                expect(
                    app.factory.bind(null, 'test', 'test')
                ).to.throw();
            });
        });
        it(
            'test Controller throws an error if not called with a function',
            function() {
                expect(app.Controller.bind(null, 'test', 'test')).to.throw();
            }
        );
        it('test Controller makes a call to $$register', function() {
            app.Controller('test', noop);
            expect(app.$$register.calls[0].args).to.deep.eq([
                'Controllers',
                'test',
                noop
            ]);
        });
        it('test controller makes a call to $$register', function() {
            app.controller('test', noop);
            expect(app.$$register.calls[0].args).to.deep.eq([
                'Controllers',
                'test',
                noop
            ]);
        });
    });
    describe('config', function() {
        beforeEach(function() {
            mock($LogProvider, 'warn', noop);
        });
        it('test config returns app', function() {
            expect(app.config()).to.deep.eq(app);
        });
        it('test config not added as string', function() {
            app.config('test');
            expect(app.configs).to.deep.eq([]);
            expect($LogProvider.warn).to.have.been.called;
        });
        it('test config added when called with function', function() {
            app.config(noop);
            expect(app.configs[0]).to.deep.eq({
                fn: noop
            });
            expect($LogProvider.warn).to.not.have.been.called;
        });
    });
    describe('$$tearDown', function() {
        beforeEach(function() {
            app.service('test', {});
        });
        it('test called with no name does nothing', function() {
            expect(app.$$tearDown()).to.deep.eq(app);
            expect(app.$$registry.test).to.eq('services');
            expect(app.services.test).to.deep.eq({});
        });
        it('test called with an improper service name', function() {
            expect(app.$$tearDown('test2')).to.deep.eq(app);
            expect(app.$$registry.test).to.eq('services');
            expect(app.services.test).to.deep.eq({});
        });
        it('test called with a proper service name', function() {
            expect(app.$$tearDown('test')).to.deep.eq(app);
            expect(app.$$registry.test).to.be.undefined;
            expect(app.service.test).to.be.undefined;
        });
        it('test called with many arguments', function() {
            app.service('test2', {});
            expect(app.$$tearDown('test', 'test2')).to.deep.eq(app);

            expect(app.$$registry.test).to.be.undefined;
            expect(app.service.test).to.be.undefined;

            expect(app.$$registry.test1).to.be.undefined;
            expect(app.service.test1).to.be.undefined;
        });
        it('test called with an array argument', function() {
            app.service('test2', {});
            expect(app.$$tearDown([ 'test', 'test2' ])).to.deep.eq(app);

            expect(app.$$registry.test).to.be.undefined;
            expect(app.service.test).to.be.undefined;

            expect(app.$$registry.test1).to.be.undefined;
            expect(app.service.test1).to.be.undefined;
        });
    });
    describe('$$loadDependencies', function() {
        beforeEach(function() {
            mock(fs, 'readFileSync', () => '{ "test": "test" }');
            mock($LogProvider, 'error', noop);
            mock(app, '$$bootstrap', () => new Promise());
        });
        afterEach(() => simple.restore());
        it('test called with no dependencies', function() {
            expect(app.$$loadDependencies().val).to.deep.eq([]);
        });
        it('test called with dependencies', function() {
            expect(app.$$loadDependencies([ 'test' ]).val.length).to.eq(1);
            assert(fs.readFileSync.called);
            expect(app.$$bootstrap).to.have.been.called;
        });
        it('test invalid JSON in AngieFile', function() {
            fs.readFileSync = () => '{,}';
            app.$$loadDependencies([ 'test' ]);
            expect($LogProvider.error).to.have.been.called;
            expect(app.$$bootstrap).to.not.have.been.called;
        });
    });
    describe('$$bootstrap', function() {
        let spy;

        beforeEach(function() {
            mock(fs, 'readdirSync', () => [ 'test' ]);
            simple.mock(Promise, 'all');
            spy = simple.spy();
            app.configs = [
                {
                    fn: spy
                }
            ];
        });
        afterEach(() => simple.restore());
        xit('test $$bootstrap with node_modules', function() {
            fs.readdirSync.returnWith([ 'node_modules' ]);
            app.$$bootstrap();
            expect(Promise.all.calls[0].args[0]).to.deep.eq([]);
            expect(spy).to.have.been.called;
            expect(app.configs).to.deep.eq([]);
        });
        xit('test $$bootstrap with non-js files', function() {
            app.$$bootstrap();
            expect(Promise.all.calls[0].args[0]).to.deep.eq([]);
            expect(spy).to.have.been.called;
        });
        xit('test $$bootstrap', function() {
            fs.readdirSync.returnWith([ 'test.js' ]);
            expect(app.$$bootstrap().val).to.be.true;
            expect(spy).to.have.been.called;
            expect(app.configs).to.deep.eq([]);
        });
    });
});