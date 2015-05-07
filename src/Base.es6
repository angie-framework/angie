'use strict';

import angular from './Angular';
import Config from './Config';
import {$routeProvider} from './services/$RouteProvider';
import $compile from './services/$Compile';
import $log from './util/$LogProvider';
import $injector from './services/$injector';
import {$templateCache} from './services/$TemplateCache';

let config = Config.fetch(),
    app;

global.app = app = new angular(config.dependencies).Model('UserModel', function() {

    // TODO fields
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
}).constant('test', {
    test: 'test'
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

export default app;
