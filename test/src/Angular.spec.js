'use strict'; 'use strong';

// Global Modules
// TODO if this is used in other places, we do not need to redefine it
import 'es6-module-loader';

// Test Modules
import {expect} from                'chai';
import simple, {mock} from          'simple-mock';

// System Modules
import fs from                      'fs';
import $LogProvider from            'angie-log';

// Angie Modules
import {angular} from               '../../src/Angular';
import util from                    '../../src/util/util';
import {
    $$InvalidDirectiveConfigError
} from                              '../../src/util/$ExceptionsProvider';

describe('Angular', function() {
    let app,
        noop;

    beforeEach(function() {

        // jscs:disable
        app = new angular();
        // jscs:enable

        noop = angular.noop;
    });
    it('test extension of static angular methods from util', function() {
        expect(angular.extend).to.be.a('function');
    });
    describe('constructor', function() {
        it('test constructor properly instantiates app properties', function() {
            expect(app.constants).to.deep.eq({});
            expect(app.configs).to.deep.eq([]);
            expect(app.services).to.deep.eq({});
            expect(app.Controllers).to.deep.eq({});
            expect(app.directives).to.deep.eq({});
            expect(app.$registry).to.deep.eq({});
            expect(app.$dependencies).to.deep.eq([]);
        });
    });
    describe('$register', function() {
        beforeEach(function() {
            mock($LogProvider, 'warn', noop);
        });
        it('test register returns the app object', function() {
            expect(app.$register()).to.deep.eq(app);
        });
        it('test register called without a name fails', function() {
            app.$register('directives', null, {});
            expect(app.$registry).to.deep.eq({});
            expect(app.directives).to.deep.eq({});
            expect($LogProvider.warn).to.have.been.called;
        });
        it('test register called without an obj fails', function() {
            app.$register('directives', 'test', null);
            expect(app.$registry).to.deep.eq({});
            expect(app.directives).to.deep.eq({});
            expect($LogProvider.warn).to.have.been.called;
        });
        it('test register properly registers a provider', function() {
            app.$register('directives', 'test', 'test');
            expect(app.$registry.test).to.eq('directives');
            expect(app.directives.test).to.deep.eq('test');
        });
    });
    describe('directive', function() {
        beforeEach(function() {
            mock(app, '$register', noop);
        });
        it('test Controller and string type', function() {
            let obj = {
                Controller: 'test'
            };
            app.directive('test', function() {
                return obj;
            });
            expect(app.$register.calls[0].args).to.deep.eq(
                [ 'directives', 'test', obj ]
            );
        });
        it('test Controller deleted if not string type', function() {
            let obj = {
                Controller: noop()
            };
            app.directive('test', function() {
                return obj;
            });
            expect(app.$register.calls[0].args).to.deep.eq(
                [ 'directives', 'test', obj ]
            );
            expect(obj.Controller).to.be.undefined;
        });
        it(
            'test $ExceptionsProvider called when there is a not controller and ' +
            'directive is an API View',
            function() {
                expect(app.directive.bind(null, 'test', function() {
                    return {
                        type: 'APIView'
                    };
                })).to.throw($$InvalidDirectiveConfigError);
            }
        );
    });
    describe('constant, service, Controller', function() {
        beforeEach(function() {
            mock(app, '$register', noop);
        });
        it('test constant makes a call to $register', function() {
            app.constant('test', 'test');
            expect(app.$register.calls[0].args).to.deep.eq([
                'constants',
                'test',
                'test'
            ]);
        });
        it('test service makes a call to $register', function() {
            app.service('test', 'test');
            expect(app.$register.calls[0].args).to.deep.eq([
                'services',
                'test',
                'test'
            ]);
        });
        it('test Controller makes a call to $register', function() {
            app.Controller('test', 'test');
            expect(app.$register.calls[0].args).to.deep.eq([
                'Controllers',
                'test',
                'test'
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
                fn: noop,
                fired: false
            });
            expect($LogProvider.warn).to.not.have.been.called;
        });
    });
    describe('_tearDown', function() {
        beforeEach(function() {
            app.service('test', {});
        });
        it('test _tearDown returns app', function() {
            expect(app._tearDown()).to.deep.eq(app);
        });
        it('test _tearDown called with no name does nothing', function() {
            app._tearDown();
            expect(app.$registry.test).to.eq('services');
            expect(app.services.test).to.deep.eq({});
        });
        it('test _tearDown called with an improper service name', function() {
            app._tearDown('test1');
            expect(app.$registry.test).to.eq('services');
            expect(app.services.test).to.deep.eq({});
        });
        it('test _tearDown called with a proper service name', function() {
            app._tearDown('test');
            expect(app.$registry.test).to.be.undefined;
            expect(app.service.test).to.be.undefined;
        });
    });
    describe('loadDependencies', function() {
        beforeEach(function() {
            mock(util, 'removeTrailingSlashes', (v) => v);
            mock(fs, 'readFileSync', () => '{ "test": "test" }');
            mock($LogProvider, 'error', noop);
            mock(app, 'bootstrap', () => new Promise());
        });
        afterEach(() => simple.restore());
        it('test called with no dependencies', function() {
            expect(app.loadDependencies().val).to.deep.eq([]);
        });
        it('test called with dependencies', function() {
            expect(app.loadDependencies([ 'test' ]).val.length).to.eq(1);
            expect(util.removeTrailingSlashes.calls[0].args[0]).to.eq('test');
            expect(fs.readFileSync.calls[0].args[0]).to.eq('test/AngieFile.json');
            expect(app.bootstrap).to.have.been.called;
        });
        it('test invalid JSON in AngieFile', function() {
            fs.readFileSync = () => '{,}';
            app.loadDependencies([ 'test' ]);
            expect(util.removeTrailingSlashes.calls[0].args[0]).to.eq('test');
            expect($LogProvider.error).to.have.been.called;
            expect(app.bootstrap).to.not.have.been.called;
        });
    });
    describe('bootstrap', function() {
        let spy;

        beforeEach(function() {
            mock(fs, 'readdirSync', () => [ 'test' ]);
            mock(System, 'import', (v) => v);
            simple.mock(Promise, 'all');
            spy = simple.spy();
            app.configs = [
                {
                    fn: spy
                }
            ];
        });
        afterEach(() => simple.restore());
        it('test bootstrap with node_modules', function() {
            fs.readdirSync.returnWith([ 'node_modules' ]);
            app.bootstrap();
            expect(System.import).to.not.have.been.called;
            expect(Promise.all.calls[0].args[0]).to.deep.eq([]);
            expect(spy).to.have.been.called;
            expect(app.configs[0].fired).to.be.true;
        });
        xit('test bootstrap with non-js files', function() {
            app.bootstrap();
            expect(System.import).to.not.have.been.called;
            expect(Promise.all.calls[0].args[0]).to.deep.eq([]);
            expect(spy).to.have.been.called;
            expect(app.configs[0].fired).to.be.true;
        });
        xit('test bootstrap', function() {
            fs.readdirSync.returnWith([ 'test.js' ]);
            expect(app.bootstrap()).to.deep.eq(
                [ 'test.js', 'test.js' ]
            );
            expect(System.import).to.have.been.called;
            expect(spy).to.have.been.called;
            expect(app.configs[0].fired).to.be.true;
        });
        xit('test configs not called more than once', function() {
            app.configs[0].fired = true;
            app.bootstrap();
            expect(spy).to.not.have.been.called;
        });
    });
});


