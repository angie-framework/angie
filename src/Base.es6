'use strict';

import angular from './Angular';
import {$routeProvider} from './services/$RouteProvider';
import $compile from './services/$Compile';
import $log from './util/$LogProvider';
import $injector, {$injectionBinder} from './services/$Injector';
import {$templateCache, $resourceLoader} from './services/$TemplateCache';

const fs =      require('fs');

let app;

/* eslint-disable */

/**
 * @overview
 * @name app
 */
global.app = app = new angular()
    .Model('UserModel', function() {

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

/*eslint-enable */
        constructor() {
            this.name = 'angie_migrations';
        }
    }).config(function() {
        $templateCache.put(
            'index.html',
            fs.readFileSync(`${__dirname}/templates/html/index.html`, 'utf8')
        );
        $templateCache.put(
            '404.html',
            fs.readFileSync(`${__dirname}/templates/html/404.html`, 'utf8')
        );
    })
    .service('$routeProvider', $routeProvider)
    .service('$compile', $compile)
    .service('$logProvider', $log)
    .service('$injector', $injector)
    .service('$injectionBinder', $injectionBinder)
    .service('$scope', {
        $id: 1
    }).service('$templateCache', $templateCache)
    .service('$resourceLoader', $resourceLoader);

export default app;
