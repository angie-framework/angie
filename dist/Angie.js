/**
 * @module Angie.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _chalk = require('chalk');

var _angieLog = require('angie-log');

var _angieLog2 = _interopRequireDefault(_angieLog);

var _angieInjector = require('angie-injector');

// Angie Modules

var _Config = require('./Config');

var _controllers$ScopeProvider = require('./controllers/$ScopeProvider');

var _factories$RouteProvider = require('./factories/$RouteProvider');

var _factories$RouteProvider2 = _interopRequireDefault(_factories$RouteProvider);

var _factories$CacheFactory = require('./factories/$CacheFactory');

var _factories$CacheFactory2 = _interopRequireDefault(_factories$CacheFactory);

var _factories$Compile = require('./factories/$Compile');

var _factories$Compile2 = _interopRequireDefault(_factories$Compile);

var _factories$TemplateCache = require('./factories/$TemplateCache');

var _utilUtil = require('./util/Util');

var _util$ExceptionsProvider = require('./util/$ExceptionsProvider');

var $ExceptionsProvider = _interopRequireWildcard(_util$ExceptionsProvider);

/**
 * @desc This is the default Angie class. It is instantiated and given
 * the namespace `global.app`. Static methods are available via this
 * instance.
 *
 * It is ill advised to tray and redefine the native app as it is tightly coupled
 * with the resource pipeline & webserver, instead, use the Angie class to
 * access commonly used static methods.
 *
 * @todo rename this class
 * @since 0.0.1
 * @access public
 * @extends $Util
 * @example Angie.noop() // = undefined
 */

var Angie = (function () {
    function Angie() {
        _classCallCheck(this, Angie);

        this.constants = {};
        this.configs = [];
        this.services = {};
        this.factories = {};
        this.Controllers = {};
        this.directives = {};
        this.$dependencies = [];
        this.$$registry = {};
        this.$$loaded = false;
    }

    /**
     * @desc Creates an Angie constant provider
     *
     * @since 0.0.1
     * @access public
     *
     * @param {string} name The name of the constant being created
     * @param {object|string|number|Array<>|boolean} obj The object value
     * @returns {object} this instanceof Angie
     *
     * @example Angie.constant('foo', 'bar');
     */

    _createClass(Angie, [{
        key: 'constant',
        value: function constant(name, obj) {
            return this.$$register('constants', name, obj);
        }

        /**
         * @desc Creates an Angie service provider. This must be an object.
         *
         * @since 0.0.1
         * @access public
         *
         * @param {string} name The name of the service being created
         * @param {object} obj The object value
         * @returns {object} this instanceof Angie
         *
         * @example Angie.service('foo', {});
         */
    }, {
        key: 'service',
        value: function service(name, obj) {

            // Verify that the service is an object
            if (typeof obj !== 'object') {
                throw new $ExceptionsProvider.$$InvalidServiceConfigError(name);
            }
            return this.$$register('services', name, obj);
        }

        /**
         * @desc Creates an Angie service provider. This must be a function.
         *
         * @since 0.3.1
         * @access public
         *
         * @param {string} name The name of the factory being created
         * @param {function} fn The function value
         * @returns {object} this instanceof Angie
         *
         * @example Angie.factory('foo', () => undefined);
         */
    }, {
        key: 'factory',
        value: function factory(name, fn) {

            // Verify that the factory is a function
            if (typeof fn !== 'function' || !fn.prototype.constructor) {
                throw new $ExceptionsProvider.$$InvalidFactoryConfigError(name);
            }
            return this.$$register('factories', name, fn);
        }

        /**
         * @desc Creates an Angie Controller provider. This must be a function that
         * returns an object or an object.
         *
         * @since 0.0.1
         * @access public
         *
         * @param {string} name The name of the factory being created
         * @param {function|object} obj The Controller value
         * @param {string} obj.template An actual HTML template to be added as a
         * byproduct of the Controller
         * @param {string} obj.templatePath The path to an HTML template to be
         * added as a byproduct of the Controller
         * @returns {object} this instanceof Angie
         *
         * @example Angie.Controller('foo', () => {});
         */
    }, {
        key: 'Controller',
        value: function Controller(name, obj) {
            return this.$$register('Controllers', name, obj);
        }

        /**
         * @desc Creates an Angie directive provider. The second parameter
         * of the directive function must be an object, with properties defining the
         * directive itself.
         *
         * @since 0.2.3
         * @access public
         *
         * @param {string} name The name of the constant being created
         * @param {function|object} obj The directive value, returns directive params
         * @param {string} obj().Controller The associated directive controller
         * @param {number} obj().priority A number representing the directive's
         * priority, relative to the other declared directives
         * @param {boolean} obj().replace Does the directive root get replaced by
         * its inner HTML?
         * @param {string} obj().restrict What HTML components can parse this directive:
         *    'A': attribute
         *    'E': element
         *    'C': class
         * @param {function} obj().link A function to fire after the directive is
         * parsed
         * @param {string} obj().template An actual HTML template to be added as a
         * byproduct of the directive
         * @param {string} obj().templatePath The path to an HTML template to be
         * added as a byproduct of the directive
         * @returns {object} this instanceof Angie
         *
         * @example Angie.directive('foo', {
         *     return {
         *         Controller: 'test',
         *         link: function() {}
         *     };
         * });
         */
    }, {
        key: 'directive',
        value: function directive(name, obj) {
            var dir = typeof obj !== 'function' ? obj : new _angieInjector.$injectionBinder(obj, 'directive')();

            if (dir.hasOwnProperty('Controller')) {
                if (typeof dir.Controller !== 'string') {
                    delete dir.Controller;
                }
            } else if (/api.?view/i.test(dir.type)) {
                throw new $ExceptionsProvider.$$InvalidDirectiveConfigError(name);
            }
            return this.$$register('directives', name, dir);
        }
    }, {
        key: 'config',
        value: function config(fn) {
            if (typeof fn === 'function') {
                this.configs.push({
                    fn: fn,
                    fired: false
                });
            } else {
                _angieLog2['default'].warn('Invalid config type specified');
            }
            return this;
        }
    }, {
        key: '$$register',
        value: function $$register(component, name, obj) {

            // `component` and `app.component` should always be defined
            if (name && obj) {
                this.$$registry[name] = component;
                this[component][name] = obj;
            } else {
                _angieLog2['default'].warn('Invalid name or object ' + name + ' called on app.' + component);
            }
            return this;
        }

        // Tear down a registered component
    }, {
        key: '$$tearDown',
        value: function $$tearDown(name) {
            if (name && this.$$registry[name]) {
                var type = this.$$registry[name];
                delete this.$$registry[name];
                delete this[type][name];
            }
            return this;
        }

        /**
         * @desc Load all project dependencies from an Array of dependencies
         * specified in the AngieFile.json. This will load packages in the order
         * they are specified, exposing any application Modules to the application
         * and prepping any application configuration in the nested modules. It will
         * not load duplicate modules. Dependencies are typically declared as a
         * node_module path, but can also be declared as a singular (main) file.
         * @since 0.1.0
         * @access private
         * @param {object}  [param=[]] dependencies The Array of dependencies
         * specified in the parent or localized AngieFile.json
         */
    }, {
        key: '$$loadDependencies',
        value: function $$loadDependencies() {
            var dependencies = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

            var me = this,
                proms = [];

            // Make sure we do not load duplicate dependencies
            dependencies = dependencies.filter(function (v) {
                return me.$dependencies.indexOf(v) === -1;
            });

            // Add dependencies
            this.$dependencies = this.$dependencies.concat(dependencies);
            dependencies.forEach(function (v) {
                var dependency = _utilUtil.$StringUtil.removeTrailingLeadingSlashes(v),

                // This will load all of the modules, overwriting a module name
                // will replace it
                prom = new Promise(function (resolve) {
                    var $config = undefined,
                        name = undefined,
                        subDependencies = undefined;

                    try {
                        $config = JSON.parse(_fs2['default'].readFileSync('./node_modules/' + dependency + '/AngieFile.json', 'utf8'));
                    } catch (e) {
                        _angieLog2['default'].error(e);
                    }

                    if (typeof $config === 'object') {

                        // Grab the dependency name fo' reals
                        name = $config.projectName;

                        // Find any sub dependencies for recursive module
                        // loading
                        subDependencies = _Config.config.dependencies;

                        // Set the config in dependency configs (just in case)
                        if (!app.$dependencyConfig) {
                            app.$dependencyConfig = {};
                        }
                        app.$dependencyConfig[dependency] = $config;
                    }

                    try {

                        var service = require(dependency);

                        // TODO make this try to load not an npm project config
                        if (service) {
                            me[typeof service === 'function' ? 'factory' : typeof service === 'object' ? 'service' : 'constant'](name || _utilUtil.$StringUtil.toCamel(dependency), require(dependency));
                            _angieLog2['default'].info('Successfully loaded dependency ' + (0, _chalk.magenta)(v));
                        }
                    } catch (e) {
                        _angieLog2['default'].error(e);
                    }

                    return app.$$loadDependencies(subDependencies || []).then(resolve);
                });
                proms.push(prom);
            });
            return Promise.all(proms);
        }

        /**
         * @desc Load all of the files associated with the parent and child Angie
         * applications. This will transpile and deliver all modules associated with
         * both the parent and child applications.
         * @since 0.1.0
         * @access private
         * @param {string}  [param=process.cwd()] dir The dir to scan for modules
         */
    }, {
        key: '$$bootstrap',
        value: function $$bootstrap() {
            var dir = arguments.length <= 0 || arguments[0] === undefined ? process.cwd() : arguments[0];

            var me = this,
                src = typeof _Config.config.projectRoot === 'string' ? _utilUtil.$StringUtil.removeTrailingLeadingSlashes(_Config.config.projectRoot) : 'src';

            return new Promise(function (resolve) {
                resolve(_fs2['default'].readdirSync(dir + '/' + src).map(function (v) {
                    return dir + '/src/' + v;
                }));
            }).then(function (files) {
                var proms = [],
                    fn = function loadFiles(files) {

                    // We don't want to load any of these files
                    files.forEach(function (v) {
                        if (/node_modules|bower_components|templates|static/i.test(v)) {

                            // If any part of our url contains these return
                            return;
                        } else if (['js', 'es6'].indexOf(v.split('.').pop() || '') > -1) {
                            try {
                                require(v);
                                _angieLog2['default'].info('Successfully loaded file ' + (0, _chalk.blue)(v));
                            } catch (e) {
                                _angieLog2['default'].error(e);
                            }
                        } else {
                            try {
                                fn(_fs2['default'].readdirSync(v).map(function ($v) {
                                    return v + '/' + $v;
                                }));
                            } catch (e) {
                                _angieLog2['default'].warn('Treating ' + (0, _chalk.blue)(v) + ' as a directory, but it is a file');
                            }
                        }
                    });
                };
                fn(files);
                return Promise.all(proms);
            }).then(function () {

                // Once all of the modules are loaded, run the configs
                me.configs.forEach(function (v) {

                    // Check to see if the config has already fired, if it has, we
                    // do not want to fire it again
                    if (!v.fired) {
                        new _angieInjector.$injectionBinder(v.fn, 'config')();

                        // Mark as fired
                        v.fired = true;
                    }
                });
            });
        }
    }, {
        key: '$$load',
        value: function $$load() {
            var me = this;

            // Do not call load twice
            if (this.$$loaded === true) {
                return new Promise(function (r) {
                    r();
                });
            }

            // Load any app dependencies
            return this.$$loadDependencies(_Config.config.dependencies).then(function () {

                // Set the app in a loaded state
                me.$$loaded = true;

                // Bootstrap the application
                me.$$bootstrap();
            });
        }
    }]);

    return Angie;
})();

var app = global.app = new Angie();
app.config(function () {
    _factories$TemplateCache.$templateCache.put('index.html', _fs2['default'].readFileSync(__dirname + '/templates/html/index.html', 'utf8'));
    _factories$TemplateCache.$templateCache.put('404.html', _fs2['default'].readFileSync(__dirname + '/templates/html/404.html', 'utf8'));
}).factory('$Routes', _factories$RouteProvider2['default']).factory('$Cache', _factories$CacheFactory2['default']).factory('$compile', _factories$Compile2['default']).factory('$resourceLoader', _factories$TemplateCache.$resourceLoader)

// Error utilities
.service('$Exceptions', $ExceptionsProvider)

// TODO we shouldn't have to expose this?
.service('$scope', _controllers$ScopeProvider.$scope).service('$window', {}).service('$document', {}).service('$templateCache', _factories$TemplateCache.$templateCache);

exports['default'] = app;
exports.Angie = Angie;