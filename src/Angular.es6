'use strict';

import Config from './Config';
import {$routeProvider} from './services/$RouteProvider';
import $injector from './services/$injector';
import {$templateCache} from './services/$TemplateCache';
import $compile from './services/$Compile';
import util from './util/util';
import $log from './util/$LogProvider';

const chalk =       require('chalk'),
      fs =          require('fs');

const p = process,
      config = Config.fetch();

class Angular {
    constructor(dependencies = []) {
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
        let proms = [],
            files;

        // Load all of the files from the project
        // TODO also look for ".config." files
        [
          'controllers', 'directives', 'services', 'models', 'configs'
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

        // Once all of the modules are loaded, run the configs
        return Promise.all(proms).then(function() {
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
        });
    }
}

Angular = util.extend(Angular, util);

function __register__(component, name, obj) {
    if (this[component]) {
        this.__registry__[name] = component;
        this[component][name] = obj;
    }
}

// TODO move this into it's own module
let app = new Angular(config.dependencies).Model('UserModel', function() {
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
})
.service('$routeProvider', $routeProvider)
.service('$compile', $compile)
.service('$logProvider', $log)
.service('$injector', $injector)
.service('$scope', {})
.service('$templateCache', $templateCache);

global.app = app;
global.angular = Angular;

export {app, Angular as angular};
