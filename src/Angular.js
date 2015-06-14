'use strict'; 'use strong';

import util from './util/util';
import $log from './util/$LogProvider';
import $Exceptions from './util/$ExceptionsProvider';
import {BaseModel} from './models/BaseModel';
import {$injectionBinder} from './services/$Injector';

const fs =          require('fs');

const p = process;

/**
 * This is the default Angie Angular class. It is instantiated and given
 * the namespace `global.app`. Static methods are available via this
 * instance.
 * @example
 */
class Angular {

    /**
     * Constructor
     */
    constructor() {
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
     * Creates an Angie Angular constant provider
     * @param {string} name The name of the constant being created
     * @param {object|string|number|Array<>|boolean} obj The object value
     * @returns {object} this instanceof Angular
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
        let dir = new $injectionBinder(obj)();

        if (dir.hasOwnProperty('Controller') && typeof dir.Controller !== 'string') {
            delete dir.Controller;
        }
        if (dir.type === 'APIView' && !dir.hasOwnProperty('Controller')) {
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
        obj = obj.prototype ? new obj() : typeof obj === 'function' ? obj() : obj;
        name = typeof name === 'string' ? name : obj.name;

        let instance = new BaseModel(name);

        // Mock extend obj onto the instance
        if (typeof obj === 'object') {
            instance = this.extend(instance, obj);
        } else {
            $Exceptions.$$invalidModelConfig(name);
        }

        return this._register('Models', name, instance);
    }
    _register(component, name, obj) {
        if (this[component]) {
            this._registry[name] = component;
            this[component][name] = obj;
        }
        return this;
    }
    loadDependencies(dependencies = []) {
        let me = this,
            proms = [];

        // Add dependencies
        this._dependencies = this._dependencies.concat(dependencies);

        if (dependencies) {
            dependencies.forEach(function(v) {

                if (v.charAt(v.length - 1) === '/') {
                    v = v.slice(v.length - 1, 1);
                }

                // This should be the root folder of an Angie project
                let config = fs.readFileSync(`${v}/AngieFile.json`) || '{, }';

                try {
                    config = JSON.parse(config);
                } catch(e) {
                    $log.error(`Could not load ${v}, error parsing AngieFile`);
                    return;
                }

                // This will load all of the modules, overwriting a module name
                // will replace it
                let prom = new Promise(function(resolve) {
                    me.bootstrap(v).then(function() {
                        resolve();
                    }).then(function() {
                        me.loadDependencies(config.dependencies);
                    });
                });
                proms.push(prom);
            });
        }

        // TODO issue with this taking too long
        return Promise.all(proms);
    }
    bootstrap(dir = p.cwd()) {
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
                    new me.services.$injectionBinder(v.fn)();
                }
            });

            resolve();
        });
    }
    __dropBootStrapMethods__() {
        delete this._register;
        delete this.constant;
        delete this.service;
        delete this.Controller;
        delete this.directive;
        delete this.config;
        delete this.Model;
        return this;
    }
    static noop() {}
}

Angular = util.extend(Angular, util);
const angular = global.angular = class angular extends Angular{};
export default angular;
