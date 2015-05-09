'use strict';

import {config} from './Config';
import util from './util/util';
import $log from './util/$LogProvider';

const System =      require('systemjs'),
      chalk =       require('chalk'),
      fs =          require('fs');

const p = process;

System.transpiler = 'babel';

let angular = class Angular {
    constructor() {
        this.constants = {};
        this.configs = [];
        this.services = {};
        this.Controllers = {};
        this.Models = {};
        this.directives = {};
        this.__registry__ = {};
        this.__dependencies__ = [];
        return this;
    }
    constant(name, obj) {
        __register__.call(this, 'constants', name, obj);
        return this;
    }
    config(fn) {
        this.configs.push({
            fn: fn,
            fired: false
        });
        return this;
    }
    service(name, obj) {
        __register__.call(this, 'services', name, obj);
        return this;
    }
    Controller(name, obj) {
        __register__.call(this, 'Controllers', name, obj);
        return this;
    }
    Model(name, obj) {
        __register__.call(this, 'Models', name, obj);
        return this;
    }
    loadDependencies(dependencies = []) {
        let me = this,
            proms = [];

        // Add dependencies
        this.__dependencies__ = this.__dependencies__.concat(dependencies);

        if (dependencies) {
            dependencies.forEach(function(v) {

                if (v.charAt(v.length - 1) === '/') {
                    v = v.slice(v.length - 1, 1);
                }

                // This should be the root folder of an Angie project
                let config = fs.readFileSync(`${v}/AngieFile.json`) || '{,}';

                try {
                    config = JSON.parse(config);
                } catch(e) {
                    $log.error(`Could not load ${v}, error parsing AngieFile`);
                    return;
                }

                // This will load all of the modules, overwriting a module name
                // will replace it
                let prom = new Promise(function(resolve, reject) {
                    me.bootstrap(v).then(function() {
                        resolve();
                    }).then(function() {
                        me.loadDependencies(config.dependencies);
                    });
                });
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
        // TODO use the System module loader
        //return System.import(`${__dirname}/Base.es6`).then(function(app)
        return new Promise(function(resolve) {

            // Once all of the modules are loaded, run the configs
            me.configs.forEach(function(v) {

                // Check to see if the config has already fired, if it has, we
                // do not want to fire it again
                if (!v.fired) {
                    try {
                        let str = v.fn.toString(),
                            args = str.match(/(function.*\(.*\))/g),
                            providers = [];

                        if (args && args.length) {
                            args = args[0].replace(/(function\s+\(|\))/g, '').split(',');
                            providers = app.services.$injector.get.apply(app, args);
                        }

                        return providers.length ? v.fn(...providers) : v.fn(providers);
                    } catch(e) {
                        new v.fn();
                    }
                }
            });

            resolve();
        });
    }
    static noop() {}
}

angular = util.extend(angular, util);

function __register__(component, name, obj) {
    if (this[component]) {
        this.__registry__[name] = component;
        this[component][name] = obj;
    }
}

global.angular = angular;
export default angular;
