'use strict'; 'use strong';

import angular from './Angular';
import * as AngieModelFields from './models/Fields';
import {$routeProvider} from './services/$RouteProvider';
import $compile from './services/$Compile';
import $ExceptionsProvider from './util/$ExceptionsProvider';
import $log from './util/$LogProvider';
import $injector, {$injectionBinder} from './services/$Injector';
import {$templateCache, $resourceLoader} from './services/$TemplateCache';

const fs =      require('fs');

let app;

/* eslint-disable */

global.app = app = new angular()
    .Model('AngieUserModel', function() {
        let obj = {};
        // TODO fields
        obj.name = 'angie_user';
        obj.username = new AngieModelFields.CharField({
            minLength: 1,
            maxLength: 50,
            unique: true
        });
        obj.migration = new AngieModelFields.ForeignKeyField('angie_migrations', {
            nullable: true,
            nested: true
        });
        obj.save = function() {
            // TODO this would override the base, but using an es6 class will not
        };
        return obj;
    }).Model('AngieMigrationsModel', class MigrationsModel {

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
    .service('$Log', $log)
    .service('$Exceptions', $ExceptionsProvider)
    .service('$injector', $injector)
    .service('$injectionBinder', $injectionBinder)
    .service('$scope', {
        $id: 1
    }).service('$templateCache', $templateCache)
    .service('$resourceLoader', $resourceLoader);

export default app;
