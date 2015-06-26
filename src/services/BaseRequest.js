'use strict'; 'use strong';

import app from                                 '../Angular';
import {config} from                            '../Config';
import $Request from                            './$Request';
import {$Response} from                         './$Responses';
import {$routeProvider} from                    './$RouteProvider';
import {$templateCache, $templateLoader} from   './$TemplateCache';
import {$injectionBinder} from                  './$Injector';
import _mimeTypes from                          '../util/MimeTypes';
import $compile from                            './$Compile';
import util from                                '../util/util';
import $log from                                '../util/$LogProvider';

// TODO move these out to an app constant
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

/**
 * @desc The BaseRequest class processes all of the incoming Angie requests. It
 * can be required using a module import, but probably should not be unless it
 * it being subclassed for a dependency package.
 * @todo Make this class private
 * @todo Move base request
 * @since 0.0.1
 */
class BaseRequest {
    constructor(path, request, response) {

        // TODO convert this to docs
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
        this.response = new $Response(response).response;
        this.response._responseContent = '';

        // Parse out the response content type
        let contentType = this.request.headers.accept;

        if (contentType && contentType.indexOf(',') > -1) {
            contentType = contentType.split(',')[0];
        } else if (
            path.indexOf('.') > -1  &&

            // TODO mimetypes should never return undefined
            _mimeTypes[ path.split('.').pop() ]
        ) {
            contentType = _mimeTypes[ path.split('.').pop() ];
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

    /**
     * @desc This method performs the route on the incoming request object and
     * the associated path. If there is a matching path using RegExp, the
     * existing matched params will be parsed out of the path. If not, a standard
     * router will be used.
     * @since 0.2.3
     * @returns {function} BaseRequest.prototype.controllerPath or
     * BaseRequest.prototype.otherPath
     */
    _route() {

        //  TODO Also, we can add a check to see what the extension passed is for
        // content type if the content type of the request has not already been
        // set

        // Check against all of the RegExp routes
        if (Object.keys(this.routes.regExp).length) {
            for (let route in this.routes.regExp) {

                // Slice characters we do not need to instantiate a new RegExp
                let regExpRoute = util.removeTrailingLeadingSlashes(route),

                    // Cast the string key of the routes.regExp object as a
                    // RegExp obj
                    pattern = new RegExp(regExpRoute);
                if (pattern.test(this.path)) {
                    this.route = this.routes.regExp[ route ];

                    // Hooray, we've set our route, now we need to do some additional
                    // param parsing
                    util.extend(
                        this.request.query,
                        $routeProvider._parseURLParams(pattern, this.path)
                    );
                }
            }
        }

        // Check for a matching string path
        if (!this.route && this.routes[ this.path ]) {
            this.route = this.routes[ this.path ];
        }

        // Route the request based on whether the route exists
        if (this.route) {
            return this.controllerPath();
        }
        return this.otherPath();
    }
    controllerPath() {
        let me = this,
            prom;

        // TODO move all of this out to responses
        prom = new Promise(function(resolve, reject) {
            let controllerName = me.route.Controller;

            // Get controller and compile scope
            if (controllerName) {
                if(app.Controllers[ controllerName ]) {
                    let controller = app.Controllers[ controllerName ];

                    app.Controller = app.services.$response.Controller = {
                        done: resolve
                    };

                    me.controller = new $injectionBinder(controller).call(
                        app.services.$scope,
                        resolve
                    );
                    if (
                        !me.controller ||
                        !me.controller.constructor ||
                        me.controller.constructor.name !== 'Promise'
                    ) {
                        resolve(controllerName);
                    }
                } else {

                    // TODO controller was not found despite being defined?
                    // TODO exception
                    reject(`No Controller named "${controllerName}" could be found`);
                }
            } else {
                resolve(controllerName);
            }
        });

        // Find and load template
        prom = prom.then(function(controllerName) {
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
                    _mimeTypes[
                        me.route.templatePath.split('.').pop()
                    ]
                ) {
                    me.responseHeaders[ 'Content-Type' ] = _mimeTypes[
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
                return me.unknownPath();
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
            me.responseContent = me.response._responseContent;

            if (me.template) {

                // Render the template into the resoponse
                return new Promise(function(resolve) {

                    // $Compile to parse template strings and app.directives
                    return $compile(me.template)(

                        // In the context of the scope
                        app.services.$scope
                    ).then(function(template) {
                        resolve(template);
                    });
                }).then(function(template) {
                    me.responseContent += template;
                    me.response._responseContent = me.responseContent;

                    return controllerName;
                });
            }

            return controllerName;
        });

        // TODO See if any views have this Controller associated
        // prom = prom.then(function(controllerName) {
        //     for (let key in app._registry) {
        //         if (app._registry[ key ] === 'directive') {
        //             let directive = app.directives[ key ];
        //             if (
        //                 directive.Controller &&
        //                 directive.Controller === controllerName &&
        //                 directive.type === 'APIView'
        //             ) {
        //
        //                 // APIViews cannot have templates, all templates are trashed
        //                 if (me.template) {
        //                     delete me.template;
        //                     delete me._responseContent;
        //
        //                     //me.responseHeaders = {};
        //                     $log.warn(
        //                         `Attempted to load template on view ${key}: ` +
        //                         'Templates cannot be rendered by an APIView'
        //                     );
        //                 }
        //
        //
        //                 // We have made it so only one APIView directive can
        //                 // be fired at a time
        //                 break;
        //             }
        //         }
        //     }
        // });

        prom.then(function() {
            me.response.writeHead(
                200,
                RESPONSE_HEADER_MESSAGES[ '200' ],
                me.responseHeaders
            );
            me.response.write(me.responseContent);
        });

        prom.catch(function(e) {
            $log.error(e);
            return me.errorPath();
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

        return this[ `${ this.path === '/' ? 'default' : 'unknown' }Path` ]();
    }
    defaultPath() {

        // Load default page
        let index = $templateLoader('index.html');

        // If the index page could not be found
        if (!index) {
            return this.unknownPath();
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
    unknownPath() {

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
    errorPath() {
        this.response.writeHead(
            500,
            RESPONSE_HEADER_MESSAGES[ '500' ],
            this.responseHeaders
        );
        this.response.write(`<h1>${RESPONSE_HEADER_MESSAGES[ '500' ]}</h1>`);
    }
}

export {
    BaseRequest,
    DEFAULT_CONTENT_TYPE,
    RESPONSE_HEADER_MESSAGES,
    PRAGMA_HEADER,
    NO_CACHE_HEADER
};

// TODO break up this file
