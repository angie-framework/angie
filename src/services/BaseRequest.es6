'use strict'; 'use strong';

import app from '../Base';
import {config} from '../Config';
import util from '../util/util';
import $log from '../util/$LogProvider';
import $Request from './$Request';
import {$Response} from './$Responses';
import {$routeProvider} from './$RouteProvider';
import {$templateCache, $templateLoader} from './$TemplateCache';
import {$injectionBinder} from './$Injector';
import __mimetypes__ from '../util/MimeTypes';
import $compile from './$Compile';


// TODO move these out to a constant
const DEFAULT_CONTENT_TYPE = {
          'Content-Type': 'text/plain'
      },
      RESPONSE_HEADER_MESSAGES = {
          '200': 'OK',
          '404': 'File Not Found',
          '500': 'Invalid Request'
      },
      PRAGMA_HEADER = 'no-cache',
      NO_CACHE_HEADER = 'private, no-cache, no-store, must-revalidate';

class BaseRequest {
    constructor(path, request, response) {

        // Cases:
        // Controller & templatePath (default) --> compiles template in scope
        // --> view
        // Controler & template --> compiles template in scope
        // --> view
        // Controller --> fires Controller, expects response
        // --> view
        // templatePath (default) --> serves template, expects compilation on frontend
        // template --> serves template, expects compilation on frontend
        // --> no views

        // Define URI
        this.path = path;

        // Shortcut to set and receive the request object
        this.request = new $Request(request).request;

        // Make the response object available to the API
        response.__responseContent__ = '';
        this.response = new $Response(response).response;

        // Parse out the response content type
        let contentType = this.request.headers.accept;

        if (contentType && contentType.indexOf(',') > -1) {
            contentType = contentType.split(',')[0];
        } else if (
            path.indexOf('.') > -1  &&

            // TODO mimetypes should never return undefined
            __mimetypes__[ path.split('.').pop() ]
        ) {
            contentType = __mimetypes__[ path.split('.').pop() ];
        } else {
            contentType = 'text/plain';
        }

        this.responseContentType = contentType;
        this.responseHeaders = {
            'Content-Type': this.responseContentType
        };

        // Grab the routes and the otherwise
        this.routes = $routeProvider.fetch().routes;
        this.otherwise = $routeProvider.fetch().otherwise;
    }
    route() {

        // If the route exists:
        if (this.routes[ this.path ]) {
            this.route = this.routes[ this.path ];

            return this.controllerPath();
        } else {
            return this.otherPath();
        }
    }
    controllerPath() {
        let me = this,
            prom,
            error = false;

        prom = new Promise(function(resolve, reject) {
            let controllerName = me.route.Controller;

            // Get controller and compile scope
            if (controllerName) {
                if(app.Controllers[ controllerName ]) {
                    let controller = app.Controllers[ controllerName ];

                    app.Controller = app.services.$response.Controller = {
                        done: resolve
                    };

                    me.controller = new $injectionBinder(controller)(resolve);
                    if (
                        !me.controller ||
                        !me.controller.constructor ||
                        me.controller.constructor.name !== 'Promise'
                    ) {
                        resolve();
                    }
                } else {

                    // TODO controller was not found despite being defined?
                    // TODO exception
                    $log.error(`No Controller named "${controllerName}" could be found`);
                    reject();
                }
            } else {
                resolve();
            }
        });

        // Find and load template
        prom.then(function() {
            console.log('DO I GET HERE');
            try {
                if (
                    me.route.template &&
                    typeof me.route.template === 'string' &&
                    me.route.template.length > 0
                ) {
                    me.template = me.route.template;

                } else if (me.route.templatePath) {

                    // Check to see if we can associate the template path with a
                    // mime type
                    if (
                        me.route.templatePath.indexOf('.') > -1 &&

                        // TODO mimetypes should never return undefined
                        __mimetypes__[
                           me.route.templatePath.split('.').pop()
                       ]
                    ) {
                        me.responseHeaders[ 'Content-Type' ] = __mimetypes__[
                            me.route.templatePath.split('.').pop()
                        ];
                    }
                    me.template = $templateCache.get(me.route.templatePath);
                }

                // If there is a template/templatePath defined we should have a template
                if (
                    (me.route.template || me.route.templatePath) &&
                    !me.template
                ) {
                    return me.errorPath();
                } else if (
                    config.hasOwnProperty('cacheStaticAssets') &&
                    !config.cacheStaticAssets
                ) {

                    // If there is a template, check to see if caching is set
                    me.responseHeaders = util.extend(me.responseHeaders, {
                        'Expires': -1,
                        'Pragma': PRAGMA_HEADER,
                        'Cache-Control': NO_CACHE_HEADER
                    });
                }

                // Pull the response back in from wherever it was before
                me.responseContent = me.response.__responseContent__;

                // TODO ^^ Still need to check here whether there is a template?
                if (me.template) {

                    // TODO render the template into the resoponse
                    me.responseContent += $compile(me.template)(app.services.$scope);

                    // TODO does this cause issues with directives
                    me.response.__responseContent__ = me.responseContent;
                }
            } catch(e) {
                error = !!e;
            } finally {
                console.log('ALSO HERE');
                return true;
            }
        });

        // TODO See if any views have this Controller associated
        // TODO instantiate directives beforehand
        // for (let key in app.directives) {
        //     let directive = app.directives[ key ];
        //     if (
        //         directive.Controller &&
        //         directive.Controller === controllerName
        //     ) {
        //
        //         if (directive.type === 'APIView') {
        //
        //             // APIViews cannot have templates, all templates are trashed
        //             delete this.template;
        //             // delete this.__responseContent__;
        //             this.responseHeaders = {};
        //
        //             // TODO fire off link
        //         }
        //
        //         // TODO the execution of these directives should only occur
        //         // in template compilation
        //         // else if (directive.type === 'TemplateView') {
        //         //
        //         // }
        //     }
        // }

        prom.then(function() {
            if (error) {
                $log.error(e);
                me.response.writeHead(
                    500,
                    RESPONSE_HEADER_MESSAGES['500'],
                    me.responseHeaders
                );
                me.response.write(`<h1>${RESPONSE_HEADER_MESSAGES['500']}</h1>`);
            } else {
                me.response.writeHead(
                    200,
                    RESPONSE_HEADER_MESSAGES['200'],
                    me.responseHeaders
                );
                me.response.write(me.responseContent);
            }
            console.log('AND HERE');
            return true;
        });

        return prom;
    }
    otherPath() {
        let me = this;

        if (this.otherwise) {

            // Redirect the page to a default page
            // TODO test otherwise redirects to absolute path or full link
            return new Promise(function() {
                me.response.statusCode = 302;
                me.response.setHeader('Location', `${me.otherwise}`);
                arguments[0]();
            });
        }

        return this[ `${this.path === '/' ? 'default' : 'error'}Path` ]();
    }
    defaultPath() {

        // Load default page
        let index = $templateLoader('index.html');

        // If the index page could not be found
        if (!index) {
            return this.errorPath();
        }

        // Write the response
        let me = this;
        return new Promise(function() {
            me.response.writeHead(
                200,
                RESPONSE_HEADER_MESSAGES['200'],
                me.responseHeaders
            );
            me.response.write(index);
            arguments[0]();
        });
    }
    errorPath() {

        // Load page not found
        let fourOhFour = $templateLoader('404.html');


        let me = this;
        return new Promise(function() {
            me.response.writeHead(
                404,
                RESPONSE_HEADER_MESSAGES['404'],
                me.responseHeaders
            );
            me.response.write(fourOhFour);
        });
    }
}

export {
    BaseRequest,
    DEFAULT_CONTENT_TYPE,
    RESPONSE_HEADER_MESSAGES,
    PRAGMA_HEADER,
    NO_CACHE_HEADER
};
