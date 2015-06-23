'use strict'; 'use strong';

// System Modules
import fs from                                  'fs';

// Angie Modules
import angular from                             './Angular';
import * as AngieModelFields from               './models/Fields';
import {$routeProvider} from                    './services/$RouteProvider';
import $compile from                            './services/$Compile';
import $injector, {$injectionBinder} from       './services/$Injector';
import {$templateCache, $resourceLoader} from   './services/$TemplateCache';
import $ExceptionsProvider from                 './util/$ExceptionsProvider';
import $log from                                './util/$LogProvider';

let app = new angular()
    .config(function() {
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

    // Model utilities
    .service('$fields', AngieModelFields)

    // Logging  utilities
    .service('$Log', $log)
    .service('$Exceptions', $ExceptionsProvider)
    .service('$injector', $injector)
    .service('$injectionBinder', $injectionBinder)
    .service('$scope', { $id: 1 })
    .service('$window', {})
    .service('$document', {})
    .service('$templateCache', $templateCache)
    .service('$resourceLoader', $resourceLoader);

global.app = app;
export default app;

// TODO open this back up when you have an admin model
// .Model('AngieUserModel', function() {
//     let obj = {};
//     // TODO fields
//     obj.name = 'angie_user';
//     obj.username = new AngieModelFields.CharField({
//         minLength: 1,
//         maxLength: 50,
//         unique: true
//     });
//     obj.migration = new AngieModelFields.ForeignKeyField('angie_migrations', {
//         nullable: true,
//         nested: true
//     });
//     obj.save = function() {
//         // TODO this would override the base, but using an es6 class will not
//     };
//     return obj;
// }).Model('AngieMigrationsModel', class MigrationsModel {
//     constructor() {
//         this.name = 'angie_migrations';
//     }
// })
