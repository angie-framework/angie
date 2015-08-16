/**
 * @module Angie.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
import $LogProvider from                        'angie-log';
import {$injectionBinder} from                  'angie-injector';

// Angie Modules
import app from                                 '../Angie';
import {config} from                            '../Config';
import $Request from                            './$Request';
import {$Response} from                         './$Responses';
import {default as $Routes} from                '../factories/$RouteProvider';
import {
    $templateCache,
    $$templateLoader
} from                                          '../factories/$TemplateCache';
import $compile from                            '../factories/$Compile';
import {default as $MimeType} from              '../util/$MimeTypeProvider';

import $Util, {
    $StringUtil
} from                                          '../util/Util';

app.constant('RESPONSE_HEADER_MESSAGES', {
    200: 'OK',
    404: 'File Not Found',
    500: 'Invalid Request'
}).constant(
    'PRAGMA_HEADER',
    'no-cache'
).constant(
    'NO_CACHE_HEADER',
    'private, no-cache, no-store, must-revalidate'
);

/**
 * @desc The BaseRequest class processes all of the incoming Angie requests. It
 * can be required using a module import, but probably should not be unless it
 * it being subclassed for a dependency package.
 * @todo Make this class private ($$)
 * @todo Move base request
 * @since 0.0.1
 */
class BaseRequest {
    constructor(path, request, response) {

        // Define URI
        this.path = path;

        // Shortcut to set and receive the request object
        this.request = new $Request(request).request;

        // Make the response object available to the API
        this.response = new $Response(response).response;
        this.response.$responseContent = '';

        // Parse out the response content type
        let contentType = this.request.headers.accept;

        if (contentType && contentType.indexOf(',') > -1) {
            contentType = contentType.split(',')[0];
        } else {
            contentType = $MimeType.fromPath(path);
        }

        this.responseContentType = contentType;
        this.responseHeaders = {
            'Content-Type': this.responseContentType
        };

        // Grab the routes and the otherwise
        this.routes = $Routes.fetch().routes;
        this.otherwise = $Routes.fetch().otherwise;
    }

    /**
     * @desc This method performs the route on the incoming request object and
     * the associated path. If there is a matching path using RegExp, the
     * existing matched params will be parsed out of the path. If not, a standard
     * router will be used.
     * @since 0.2.3
     * @returns {function} BaseRequest.prototype.$controllerPath or
     * BaseRequest.prototype.otherPath
     */
    $$route() {

        // Check against all of the RegExp routes in Reverse
        let regExpRoutes = [];
        if (this.routes.regExp) {
            regExpRoutes = Object.keys(this.routes.regExp).reverse();
        }

        for (let i = 0; i < regExpRoutes.length; ++i) {

            // Slice characters we do not need to instantiate a new RegExp
            let regExpRoute =
                $StringUtil.removeTrailingLeadingSlashes(regExpRoutes[ i ]),

                // Cast the string key of the routes.regExp object as a
                // RegExp obj
                pattern = new RegExp(regExpRoute);

            if (pattern.test(this.path)) {
                this.route = this.routes.regExp[ regExpRoutes[ i ] ];

                // Hooray, we've set our route, now we need to do some additional
                // param parsing
                $Util._extend(
                    this.request.query,
                    $Routes.$$parseURLParams(pattern, this.path)
                );

                break;
            }
        }

        // Check for a matching string path
        if (!this.route && this.routes[ this.path ]) {
            this.route = this.routes[ this.path ];
        }

        // Route the request based on whether the route exists
        if (this.route) {
            return this.$controllerPath();
        }
        return this.otherPath();
    }

    /**
     * @desc $controllerPath is fired once a request has been routed. It fires
     * the controller once dependencies have been injected.
     *
     * Cases:
     *     Controller & templatePath (default): Compiles template in scope
     *     Controler & template: Compiles template in scope
     *     Controller: fires Controller, expects response
     *     TemplatePath (default): Serves template, expects compilation on
     * frontend
     *     Template: Serves template, expects compilation on frontend
     * @todo add documentation on views
     * @since 0.2.3
     * @access private
     */
    $controllerPath() {
        let me = this,
            prom;

        // TODO move all of this out to responses
        prom = new Promise(function(resolve, reject) {

            // TODO despite the fact that controllerName is kind of a misnomer,
            // because this can be a function, it is ok for now
            let controllerName = me.route.Controller;

            // Get controller and compile scope
            if (controllerName) {
                if (
                    app.Controllers[ controllerName ] ||
                    typeof controllerName === 'function'
                ) {

                    // Check to see if the Controller in the Route is a function
                    let controller = typeof me.route.Controller !== 'function' ?
                        app.Controllers[ controllerName ] : controllerName;

                    app.Controller = app.services.$response.Controller = {
                        done: resolve
                    };

                    me.controller = new $injectionBinder(
                        controller,
                        'controller'
                    ).call(
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
                let mime = $MimeType.fromPath(me.route.templatePath),
                    template = $templateCache.get(me.route.templatePath);
                me.responseHeaders[ 'Content-Type' ] = mime;
                me.template = template;

                // Check to see if this is an HTML template and has a DOCTYPE
                if (
                    mime === 'text/html' &&
                    /doctype(\s)?html/i.test(template) &&
                    config.loadMainScriptFile === true &&
                    me.route.useMainScriptFile !== false
                ) {

                    // If we have a text/html template, we can add a main script
                    // file
                    let tags = template.match(/<\/(body|head)>/i) || [],
                        script =
                            '<script type="text/javascript" src="application.js"' +
                            '></script>';
                    if (tags[0]) {
                        template = template.replace(
                            tags[0],
                            `${script}${tags[0]}`
                        );
                    } else {
                        template += `${script}`;
                    }
                }
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
                me.responseHeaders = $Util._extend(me.responseHeaders, {
                    Expires: -1,
                    Pragma: app.constants.PRAGMA_HEADER,
                    'Cache-Control': app.constants.NO_CACHE_HEADER
                });
            }

            // Pull the response back in from wherever it was before
            me.responseContent = me.response.$responseContent;

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
                    me.response.$responseContent = me.responseContent;

                    return controllerName;
                });
            }

            return controllerName;
        });

        // TODO See if any views have this Controller associated
        // TODO if no response type associated, use extension (already set)
        // prom = prom.then(function(controllerName) {
        //     for (let key in app.$registry) {
        //         if (app.$registry[ key ] === 'directive') {
        //             let directive = app.directives[ key ];
        //             if (
        //                 directive.Controller &&
        //                 typeof directive.Controller !== 'function'
        //                 directive.Controller === controllerName &&
        //                 directive.type === 'APIView'
        //             ) {
        //
        //                 // APIViews cannot have templates, all templates are trashed
        //                 if (me.template) {
        //                     delete me.template;
        //                     delete me.$responseContent;
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
                app.constants.RESPONSE_HEADER_MESSAGES[ '200' ],
                me.responseHeaders
            );
            me.response.write(me.responseContent);
        });

        prom.catch(function(e) {
            $LogProvider.error(e);
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
        let index = $$templateLoader('index.html');

        // If the index page could not be found
        if (!index) {
            return this.unknownPath();
        }

        // Write the response
        let me = this;
        return new Promise(function() {
            me.response.writeHead(
                200,
                app.constants.RESPONSE_HEADER_MESSAGES['200'],
                me.responseHeaders
            );
            me.response.write(index);
            arguments[0]();
        });
    }
    unknownPath() {

        // Load page not found
        let fourOhFour = $$templateLoader('404.html'),
            me = this;

        return new Promise(function() {
            me.response.writeHead(
                404,
                app.constants.RESPONSE_HEADER_MESSAGES['404'],
                me.responseHeaders
            );
            me.response.write(fourOhFour);
        });
    }
    errorPath() {
        this.response.writeHead(
            500,
            app.constants.RESPONSE_HEADER_MESSAGES[ '500' ],
            this.responseHeaders
        );
        this.response.write(
            `<h1>${app.constants.RESPONSE_HEADER_MESSAGES[ '500' ]}</h1>`
        );
    }
}

export {BaseRequest};

// TODO break up this file