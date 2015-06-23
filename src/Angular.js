'use strict'; 'use strong';

// System Modules
import fs from                  'fs';

// Angie Modules
import {BaseModel} from         './models/BaseModel';
import {$injectionBinder} from  './services/$Injector';
import util from                './util/util';
import $Exceptions from         './util/$ExceptionsProvider';
import $log from                './util/$LogProvider';

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
    constant(name, obj = {}) {
        return this._register('constants', name, obj);
    }
    service(name, obj = {}) {
        return this._register('services', name, obj);
    }
    Controller(name, obj = {}) {
        return this._register('Controllers', name, obj);
    }
    directive(name, obj = {}) {
        const dir = new $injectionBinder(obj)();

        if (
            dir.hasOwnProperty('Controller') &&
            typeof dir.Controller !== 'string'
        ) {
            delete dir.Controller;
        } else if (dir.type === 'APIView') {
            $Exceptions.$$invalidDirectiveConfig(name);
        }

        return this._register('directives', name, dir);
    }
    config(fn) {
        this.configs.push({
            fn: fn,
            fired: false
        });
        return this;
    }
    Model(name, obj = {}) {
        const model = new $injectionBinder(obj)();
        name = typeof name === 'string' ? name : model.name;

        let instance = new BaseModel(name);

        // Mock extend obj onto the instance
        if (typeof model === 'object') {
            instance = this.extend(instance, model);
        } else {
            $Exceptions.$$invalidModelConfig(name);
        }

        return this._register('Models', name, instance);
    }
    _register(component, name, obj) {
        if (component && this[ component ]) {
            this._registry[ name ] = component;
            this[ component ][ name ] = obj;
        }
        return this;
    }

    // Tear down a registered component
    _tearDown(name) {
        if (!name) {
            return false;
        }

        const type = this._registry[ name ];
        delete this._registry[ name ];
        delete this[ type ][ name ];
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

        // TODO issue with this taking too long
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
    _dropBootstrapMethods() {

        // TODO apparently I cannot do this...
        // delete this._register;
        // delete this.constant;
        // delete this.service;
        // delete this.Controller;
        // delete this.directive;
        // delete this.config;
        // delete this.Model;
        // delete this._dropBootstrapMethods;
        return this;
    }
}

export default class angular extends Angular {};
