'use strict';

import {$routeProvider} from './services/$RouteProvider';
import $injector from './services/injector';
import {$templateCache} from './services/$TemplateCache';

const chalk =       require('chalk'),
      fs =          require('fs');

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

        // Configs are loaded --> At the moment, we need not make considerations
        // for other provider types
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
}).config(function($templateCache) {
    $templateCache.put('index.html', fs.readFileSync(__dirname + '/templates/html/index.html'));
    $templateCache.put('404.html', fs.readFileSync(__dirname + '/templates/html/404.html'));

}).config(function($routeProvider) {
    $routeProvider.when('/index', {}).otherwise('/index');
}).service('$routeProvider', $routeProvider).service(
    '$injector',
    $injector
).service(
    '$templateCache',
    $templateCache
).Controller('DefaultCtrl', function($templateCache, $responses) {

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
        this.__registry__[name] = component;
        this[component][name] = obj;
    }
}


export {app, Angular as angular};
