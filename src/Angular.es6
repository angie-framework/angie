'use strict';

import Config from './Config';
import util from './util/util';

const System =      require('systemjs'),
      chalk =       require('chalk'),
      fs =          require('fs');

const p = process,
      config = Config.fetch();

System.transpiler = 'babel';

let angular = class Angular {
    constructor(dependencies = []) {
        this.constants = {};
        this.configs = [];
        this.services = {};
        this.Controllers = {};
        this.Models = {};
        this.directives = {};
        this.__registry__ = {};

        // TODO dependencies
        if (dependencies) {
            dependencies.forEach(function(v) {

            });
        }

        return this;
    }
    constant(name, obj) {
        __register__.call(this, 'constants', name, obj);
        return this;
    }
    config(fn) {
        this.configs.push(fn);
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
    $providers: {

    }
    static noop() {}
    static bootstrap() {

        let files;

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
                files = fs.readdirSync(`${p.cwd()}/${v}`);
                files.forEach(function(w) {

                    // TODO do this with System
                    require(`${p.cwd()}/src/${v}/${w}`);
                });
            } catch(e) {} // Moot error, I don't really care if you muss with things
            try {
                files = fs.readdirSync(`${p.cwd()}/src/${v}`);
                files.forEach(function(w) {

                    // TODO do this with System
                    require(`${p.cwd()}/src/${v}/${w}`);
                });
            } catch(e) {} // Moot error, I don't really care if you muss with things
        });

        // Import the app
        // TODO use the System module loader
        //return System.import(`${__dirname}/Base.es6`).then(function(app) {
        return new Promise(function(resolve) {

            // Once all of the modules are loaded, run the configs
            app.configs.forEach(function(v) {
                try {
                    let str = v.toString(),
                        args = str.match(/(function.*\(.*\))/g)[0]
                            .replace(/(function\s+\(|\))/g, '').trim().split(',');
                    v.apply(
                        app,
                        app.services.$injector.get.apply(app, args)
                    );
                } catch(e) {
                    new v();
                }
            });

            resolve();
        });
    }
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
