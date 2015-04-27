'use strict';

import {$RouteProvider as $routeProvider} from './services/Routes';
import $injector from './services/injector';

const chalk =       require('chalk');

class Angular {
    constructor() {
        this.configs = [];
        this.services = {
            $routeProvider: $routeProvider,
            $routes: function() {
                return $routeProvider.fetch();
            },
            $injector: $injector
        };
        this.Controllers = {};
        this.Models = {};
        this.directives = {};
        this.__registry__ = {
            __configs__: new Set(),
            __services__: new Set(),
            __controllers__: new Set(),
            __models__: new Set(),
            __directives__: new Set()
        };
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
    Model(name, obj) {
        __register__.call(this, 'Models', name, obj);
        return this;
    }
    $providers: {

    }
    static noop() {}
    static bootstrap() {
        // Load and fire configs
            // Check if it is a "class" or a "function" config
                // if it is a function config, to string function, find args, and load them
                    // write an injector function
                    // load dependencies
        app.configs.forEach(function(v) {
            try {
                let str = v.toString(),
                    args = str.match(/(function.*\(.*\))/g)[0]
                        .replace(/(function\s+\(|\))/g, '').trim().split(',');
                v.apply(
                    app,
                    app.services.$injector.get.apply(null, args)
                );
            } catch(e) {

                // This is a class, nothing needs to be injected
                console.log(chalk.bold(chalk.red(`Angie: [Error] ${e}`)));
                new v();
            }
        });
    }
}

let app = new Angular().Model('UserModel', function() {
    // this.username = new CharField({
    //     maxLength: 35,
    //     defaultValue: 'test'
    // });
    this.name = 'angie_users';
    this.save = function() {
        // TODO this would override the base, but using an es6 class will not
    };
    return this;
}).Model('MigrationsModel', class MigrationsModel {
    constructor() {
        this.name = 'angie_migrations';
    }
}).config(function($routeProvider) {
    $routeProvider.when('/index', {}).otherwise('/');
});

// .config(class extends $routeProvider {
//     constructor() {
//         this.when('/index', {
//
//         }).otherwise('/');
//     }
// });

function __register__(component, name, obj) {
    if (this[component]) {
        this.__registry__[`__${component.toLowerCase()}__`].add(name);
        this[component][name] = obj;
    }
}


export {app, Angular as angular};
