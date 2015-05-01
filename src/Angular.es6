'use strict';

import {$routeProvider} from './services/$RouteProvider';
import $injector from './services/$injector';
import {$templateCache} from './services/$TemplateCache';
import {$compile} from './services/$Compile';

const chalk =       require('chalk'),
      fs =          require('fs');

const p = process;

class Angular {
    constructor() {
        this.configs = [];
        this.services = {};
        this.Controllers = {};
        this.Models = {};
        this.directives = {};
        this.__registry__ = {};
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
        let proms = [];

        // Load all of the files from the project
        [
          'controllers', 'directives', 'services', 'models', 'configs'
        ].forEach(function(v) {
            console.log(v);
            try {
                fs.readdirSync(`${p.cwd()}/${v}`, function(f) {
                  console.log(f);
                  f.forEach(function(w) {
                      proms.push(System.import(w));
                  });
                });
            } catch(e) {
                console.log(e);
            } // Moot error, I don't really care if you muss with things
            try {
                fs.readdirSync(`${p.cwd()}/src/${v}`, function(f) {
                  console.log(f);
                  f.forEach(function(w) {
                      proms.push(System.import(w));
                  });
                });
            } catch(e) {
                console.log(e);
            } // Moot error, I don't really care if you muss with things
        });

        // Once all of the modules are loaded, run the configs
        Promise.all(proms).then(function() {
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

                    // This is a class, nothing needs to be injected
                    console.log(chalk.bold(chalk.red(`Angie: [Error] ${e}`)));
                    new v();
                }
            });
        });

        // Test that the registry loads test controller
        console.log(app.__registry__)
    }
}

function __register__(component, name, obj) {
    if (this[component]) {
        this.__registry__[name] = component;
        this[component][name] = obj;
    }
}


// TODO move this into it's own module
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
}).config(function($templateCache) {
    $templateCache.put('index.html', fs.readFileSync(__dirname + '/templates/html/index.html'));
    $templateCache.put('404.html', fs.readFileSync(__dirname + '/templates/html/404.html'));
}).config(function($routeProvider) {

    // TODO Recommend not making otherwise the same as any other routes
    $routeProvider.when('/index', {
        Controller: 'DefaultCtrl'
    }).otherwise('/blah');
}).service(
    '$routeProvider',
    $routeProvider
).service(
    '$injector',
    $injector
).service('$scope', {}).service(
    '$templateCache',
    $templateCache
);

global.app = app;
global.angular = Angular;

export {app, Angular as angular};
