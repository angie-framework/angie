'use strict'; 'use strong';

// System Modules
import fs from                                  'fs';

// Angie Modules
import {BaseModel} from                         './models/BaseModel';
import * as $$FieldProvider from                './models/Fields';
import $RouteProvider from                      './services/$RouteProvider';
import $compile from                            './services/$Compile';
import $injector, {$injectionBinder} from       './services/$Injector';
import {$templateCache, $resourceLoader} from   './services/$TemplateCache';
import util from                                './util/util';
import $ExceptionsProvider from                 './util/$ExceptionsProvider';
import $log from                                './util/$LogProvider';

/**
 * @desc This is the default Angie Angular class. It is instantiated and given
 * the namespace `global.app`. Static methods are available via this
 * instance.
 *
 * It is ill advised to tray and redefine the native app as it is tightly coupled
 * with the resource pipeline & webserver, instead, use the angular class to
 * access commonly used static methods.
 *
 * @todo rename this class
 * @since 0.0.1
 * @access public
 * @example angular.noop() // = undefined
 */
class Angular extends util {
    constructor() {
        super();
        this.constants = {};
        this.configs = [];
        this.services = {};
        this.Controllers = {};
        this.Models = {};
        this.directives = {};
        this._registry = {};
        this._dependencies = [];
    }

    /**
     * @desc Creates an Angie Angular constant provider
     *
     * @since 0.0.1
     * @access public
     *
     * @param {string} name The name of the constant being created
     * @param {object|string|number|Array<>|boolean} obj The object value
     * @returns {object} this instanceof Angular
     *
     * @example angular.constant('foo', 'bar');
     */
    constant(name, obj) {
        return this._register('constants', name, obj);
    }
    service(name, obj) {
        return this._register('services', name, obj);
    }
    Controller(name, obj) {
        return this._register('Controllers', name, obj);
    }

    /**
     * @desc Creates an Angie Angular directive provider. The second parameter
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
     * @returns {object} this instanceof Angular
     *
     * @example angular.directive('foo', {
     *     return {
     *         Controller: 'test',
     *         link: function() {}
     *     };
     * });
     */
    directive(name, obj) {
        const dir = typeof obj !== 'function' ? obj : new $injectionBinder(obj)();

        if (dir.hasOwnProperty('Controller')) {
            if (typeof dir.Controller !== 'string') {
                delete dir.Controller;
            }
        } else if (/api.?view/i.test(dir.type)) {
            $ExceptionsProvider.$$invalidDirectiveConfig(name);
        }
        return this._register('directives', name, dir);
    }
    config(fn) {
        if (typeof fn === 'function') {
            this.configs.push({
                fn: fn,
                fired: false
            });
        } else {
            $log.warn('Invalid config type specified');
        }
        return this;
    }
    Model(name, obj = {}) {
        const model = new $injectionBinder(obj)();
        name = typeof name === 'string' ? name : model.name;

        let instance = new BaseModel(name);

        // Mock extend obj onto the instance
        if (typeof model === 'object') {
            instance = util.extend(instance, model);
        } else {
            $ExceptionsProvider.$$invalidModelConfig(name);
        }
        return this._register('Models', name, instance);
    }
    _register(component, name, obj) {

        // `component` and `app.component` should always be defined
        if (name && obj) {
            this._registry[ name ] = component;
            this[ component ][ name ] = obj;
        } else {
            $log.warn('Invalid name or object called on app._register');
        }
        return this;
    }

    // Tear down a registered component
    _tearDown(name) {
        if (name && this._registry[ name ]) {
            const type = this._registry[ name ];
            delete this._registry[ name ];
            delete this[ type ][ name ];
        }
        return this;
    }
    loadDependencies(dependencies = []) {
        let me = this,
            proms = [];

        // Add dependencies
        this._dependencies = this._dependencies.concat(dependencies);

        dependencies.forEach(function(v) {

            let dependency = util.removeTrailingSlashes(v),

                // This should be the root folder of an Angie project
                config = fs.readFileSync(`${dependency}/AngieFile.json`) ||
                    '{, }';

            try {
                config = JSON.parse(config);
            } catch(e) {
                $log.error(
                    `Could not load ${dependency}, error parsing AngieFile`
                );
                return;
            }

            // This will load all of the modules, overwriting a module name
            // will replace it
            let prom = new Promise(function(resolve) {
                me.bootstrap(dependency).then(function() {
                    resolve();
                }).then(function() {
                    me.loadDependencies(config.dependencies);
                });
            });
            proms.push(prom);
        });
        return Promise.all(proms);
    }
    bootstrap(dir = process.cwd()) {
        let me = this,
            files;

        // Load all of the files from the project
        // TODO also look for ".config." files
        [
            'constants',
            'configs',
            'services',
            'controllers',
            'models',
            'directives'
        ].forEach(function(v) {
            try {
                files = fs.readdirSync(`${dir}/${v}`);
                files.forEach(function(w) {

                    // TODO do this with System
                    require(`${dir}/src/${v}/${w}`);
                });
            } catch(e) {} // Moot error, I don't really care if you muss with things
            try {
                files = fs.readdirSync(`${dir}/src/${v}`);
                files.forEach(function(w) {

                    // TODO do this with System
                    require(`${dir}/src/${v}/${w}`);
                });
            } catch(e) {} // Moot error, I don't really care if you muss with things
        });

        // Import the app
        return new Promise(function(resolve) {

            // Once all of the modules are loaded, run the configs
            me.configs.forEach(function(v) {

                // Check to see if the config has already fired, if it has, we
                // do not want to fire it again
                if (!v.fired) {
                    new $injectionBinder(v.fn)();
                }
            });

            resolve();
        });
    }
}

let app = global.app = new Angular();
app.config(function() {
    $templateCache.put(
        'index.html',
        fs.readFileSync(`${__dirname}/templates/html/index.html`, 'utf8')
    );
    $templateCache.put(
        '404.html',
        fs.readFileSync(`${__dirname}/templates/html/404.html`, 'utf8')
    );
})
.service('$Routes', $RouteProvider)
.service('$compile', $compile)

// Model utilities
.service('$fields', $$FieldProvider)

// Logging  utilities
.service('$Log', $log)
.service('$Exceptions', $ExceptionsProvider)

// Injection utilities
.service('$injector', $injector)

// TODO we shouldn't have to expose this?
// .service('$injectionBinder', $injectionBinder)
.service('$scope', { $id: 1 })
.service('$window', {})
.service('$document', {})
.service('$templateCache', $templateCache)
.service('$resourceLoader', $resourceLoader);

// TODO open this back up when you have an admin model
// .Model('AngieUserModel', function($fields) {
//     let obj = {};
//
//     obj.name = 'angie_user';
//     obj.username = new $fields.CharField({
//         minLength: 1,
//         maxLength: 50,
//         unique: true
//     });
//     // obj.migration = new $fields.ForeignKeyField('angie_migrations', {
//     //     nullable: true,
//     //     nested: true
//     // });
//     obj.save = function() {
//         // TODO this would override the base, but using an es6 class will not
//     };
//     return obj;
// });
// .Model('AngieMigrationsModel', class MigrationsModel {
//     constructor() {
//         this.name = 'angie_migrations';
//     }
// });

export class angular extends Angular {}
export default app;
