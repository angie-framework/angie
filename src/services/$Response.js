/**
 * @module $Response.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
import util from                    'util';
import {blue} from                  'chalk';
import {
    default as $Injector,
    $injectionBinder
} from                              'angie-injector';
import $LogProvider from            'angie-log';

// Angie Modules
import {config} from                '../Config';
import app from                     '../Angie';
import $CacheFactory from           '../factories/$CacheFactory';
import {
    $templateCache,
    $$templateLoader,
    $resourceLoader
} from                              '../factories/$TemplateCache';
import $compile from                '../factories/$Compile';
import {default as $MimeType} from  '../util/$MimeTypeProvider';
import {$FileUtil} from             '../util/Util';

const RESPONSE_HEADER_MESSAGES = $Injector.get('RESPONSE_HEADER_MESSAGES');

/**
 * @desc The $Response class controls all of the content contained in the
 * response from the Angie application. This is an extended NodeJS http/https
 * createServer response and is responsible for storing this response and the
 * content associated with the response. It can be required using a module
 * import, but probably should not be unless it is being subclassed for a
 * dependency package. It can also be used as an injected provider using
 * `$request`.
 * @since 0.4.0
 * @access public
 * @example $Injector.get('$response');
 */
class $Response {
    constructor(response) {

        // Define $Response based instance of createServer.prototype.response
        this.response = response;

        // Define the Angie $responseContent string
        this.response.$responseContent = '';
    }
}

/**
 * @desc BaseResponse defines the default Angie response. It is responsible for
 * serving the default response and setting up the headers associated with the
 * default response.
 * @since 0.4.0
 * @access private
 */
class BaseResponse {
    constructor() {
        let request,
            contentType;
        [ request, this.response ]  = $Injector.get('$request', '$response');

        // Set the route and otherwise
        [
            this.path,
            this.route,
            this.otherwise
        ] = [
            request.path,
            request.route,
            request.otherwise
        ];

        // Parse out the response content type
        contentType = request.headers ? request.headers.accept : null;
        if (contentType && contentType.indexOf(',') > -1) {
            contentType = contentType.split(',')[0];
        } else {
            contentType = $MimeType.fromPath(request.path);
        }

        // Set the response headers
        this.responseHeaders = {
            'Content-Type': this.responseContentType = contentType
        };
    }

    /**
     * @desc Sets up the headers associated with the Asset Response
     * @since 0.4.0
     * @access private
     */
    head() {
        this.response.writeHead(
            200,
            RESPONSE_HEADER_MESSAGES[ '200' ],
            this.responseHeaders
        );

        return this;
    }

    /**
     * @desc Loads the default Angie template html file, `index.html`, and
     * writes the file to the response.
     * @since 0.4.0
     * @access private
     */
    write() {
        let me = this;

        return new Promise(function(resolve) {
            me.writeSync();
            resolve();
        });
    }

    /**
     * @desc Loads the default Angie template html file, `index.html`, and
     * writes the file to the response synchronously
     * @since 0.4.0
     * @access private
     */
    writeSync() {
        this.response.write($$templateLoader('index.html'));
    }
}

/**
 * @desc AssetResponse defines any Angie response that has a path which can be
 * mapped to a path in the Angie `staticDir`s which could not be routed via a
 * controller. It is responsible for serving the asset response and setting up
 * the headers associated with the served asset.
 * @since 0.4.0
 * @access private
 * @extends {BaseResponse}
 */
class AssetResponse extends BaseResponse {
    constructor() {
        super();

        // Set the content type based on the asset path
        this.path = $Injector.get('$request').path;
    }

    /**
     * @desc Sets up the headers associated with the AssetResponse
     * @since 0.4.0
     * @access private
     */
    head() {
        super.head();

        return this;
    }

    /**
     * @desc Finds the asset and writes it to the response.
     * @since 0.4.0
     * @access private
     */
    write() {
        let assetCache = new $CacheFactory('staticAssets'),
            asset = this.response.$responseContent =
                assetCache.get(this.path) ||
                    $$templateLoader(this.path, 'static') || undefined,
            me = this;
        return new Promise(function(resolve) {
            if (asset) {
                if (
                    config.hasOwnProperty('cacheStaticAssets') &&
                    config.cacheStaticAssets === true
                ) {
                    assetCache.put(me.path, asset);
                }
                me.response.write(asset);
            } else {
                return new UnknownResponse().head().write();
            }
            resolve();
        });
    }

    /**
     * @desc Determines whether or not the response has an asset to which it can
     * be associated.
     * @param {string} path The relative url of the asset path from the
     * AngieFile.json staticDirs
     * @returns {boolean} Does the relative staticDirs path exist
     * @since 0.4.0
     * @access private
     */
    static $isRoutedAssetResourceResponse(path) {
        return config.staticDirs.some(
            (v) => !!$FileUtil.find(v, path)
        );
    }
}

/**
 * @desc ControllerResponse defines any Angie response that has a path which is
 * associated with a template or template path. It is responsible for calling
 * the controller and any post-processed templating.
 * @since 0.4.0
 * @access private
 * @extends {BaseResponse}
 */
class ControllerResponse extends BaseResponse {
    constructor() {
        super();
    }

    /**
     * @desc Sets up the headers associated with the ControllerResponse
     * @since 0.4.0
     * @access private
     */
    head() {
        super.head();
        return this;
    }

    /**
     * @desc Performs the Controller and calls any templating in the response
     * @since 0.4.0
     * @access private
     */
    write() {
        this.$scope = $Injector.get('$scope');

        let me = this;
        return new Promise(function(resolve) {
            let controller = me.route.Controller;

            // Assign a function that can be called to resolve async
            // behavior in Controllers
            app.services.$response.Controller = {
                done: resolve
            };

            // Get controller and compile scope
            if (typeof controller === 'function') {
                controller = controller;
            } else if (typeof controller === 'string') {
                if (app.Controllers[ controller ]) {
                    controller = app.Controllers[ controller ];
                } else {
                    throw new $$ControllerNotFoundError(controller);
                }
            } else {
                return resolve();
            }

            // Call the bound controller function
            return new $injectionBinder(
                controller,
                'controller'
            ).call(me.$scope, resolve);

            // Resolve the Promise if the controller does not return a
            // function
            if (
                me.controller &&
                (
                    !me.controller.constructor ||
                    me.controller.constructor.name !== 'Promise'
                )
            ) {
                return resolve(controller);
            }
        });
    }
}

/**
 * @desc ControllerTemplateResponse defines any Angie response that has a path
 * which is associated with a template. It is responsible for calling the
 * controller and any post-processed templating.
 * @since 0.4.0
 * @access private
 * @extends {ControllerResponse}
 */
class ControllerTemplateResponse extends ControllerResponse {
    constructor() {
        super();
    }

    /**
     * @desc Sets up the headers associated with the ControllerTemplateResponse
     * @since 0.4.0
     * @access private
     */
    head() {
        super.head();
        return this;
    }

    /**
     * @desc Performs the Controller templating
     * @since 0.4.0
     * @access private
     */
    write() {
        let me = this;

        return super.write().then(function() {
            me.template = me.route.template;
        }).then(
            controllerTemplateRouteResponse.bind(this)
        );
    }
}

/**
 * @desc ControllerTemplatePathResponse defines any Angie response that has a
 * path which is associated with a template path. It is responsible for calling
 * the controller and any post-processed templating.
 * @since 0.4.0
 * @access private
 * @extends {ControllerResponse}
 */
class ControllerTemplatePathResponse extends ControllerResponse {
    constructor() {
        super();
    }

    /**
     * @desc Sets up the headers associated with the
     * ControllerTemplatePathResponse
     * @since 0.4.0
     * @access private
     */
    head() {
        super.head();
        return this;
    }

    /**
     * @desc Performs the Controller path templating
     * @since 0.4.0
     * @access private
     */
    write() {
        let me = this;

        return super.write().then(function() {
            let template = $templateCache.get(me.route.templatePath);

            // Check to see if we can associate the template path with a
            // mime type
            me.responseHeaders[ 'Content-Type' ] =
                $MimeType.fromPath(me.route.templatePath);
            me.template = template;
        }).then(
            controllerTemplateRouteResponse.bind(this)
        );
    }
}

/**
 * @desc RedirectResponse is either forced as a byproduct of the controller or
 * when no other route can be matched and an "otherwise" route is defined. It
 * is responsible for serving an empty response and setting up the headers
 * associated with a 302 response.
 * @since 0.4.0
 * @access private
 * @extends {BaseResponse}
 */
class RedirectResponse extends BaseResponse {

    /**
     * @desc Loads a redirect path and the response via BaseResponse
     * @since 0.4.0
     * @access private
     */
    constructor(path) {
        super();
        this.path = path || this.otherwise;
    }

    /**
     * @desc Sets up the headers associated with the RedirectResponse
     * @since 0.4.0
     * @access private
     */
    head() {
        this.response.statusCode = 302;
        this.response.setHeader('Location', this.path);
        return this;
    }

    /**
     * @desc Placeholder method
     * @since 0.4.0
     * @access private
     */
    write() {

        // There is no content in this method
        return new Promise((r) => r());
    }
}

/**
 * @desc UnknownResponse writes any Angie response that has a path which cannot
 * be mapped to a route or a static asset. It is responsible for serving an
 * unknown response and setting up the headers associated with a 404 response.
 * @since 0.4.0
 * @access private
 * @extends {BaseResponse}
 */
class UnknownResponse extends BaseResponse {

    /**
     * @desc Loads the 404.html and the response via BaseResponse
     * @since 0.4.0
     * @access private
     */
    constructor() {
        super();
        this.html = $$templateLoader('html/404.html');
    }

    /**
     * @desc Sets up the headers associated with the UnknownResponse
     * @since 0.4.0
     * @access private
     */
    head() {
        this.response.writeHead(
            404,
            app.constants.RESPONSE_HEADER_MESSAGES['404'],
            this.responseHeaders
        );
        return this;
    }

    /**
     * @desc Writes the 404 html to the response.
     * @since 0.4.0
     * @access private
     */
    write() {
        let me = this;

        return new Promise(function(resolve) {
            me.response.write(me.html);
            resolve();
        });
    }
}

/**
 * @desc ErrorResponse defines a generic error response from Angie. It is called
 * in the event that no routes or static assets are found, there is an issue
 * with the 404 path, or a generic error occurs. It is responsible for serving an
 * error response and setting up the headers associated with a 500 response.
 * @since 0.4.0
 * @access private
 * @extends {BaseResponse}
 */
class ErrorResponse extends BaseResponse {

    /**
     * @desc Loads the error response message and the response via BaseResponse
     * @since 0.4.0
     * @access private
     */
    constructor(e) {
        super();

        let html = '<h1>';
        if (e && config.development === true) {
            html += `${e}</h1><p>${e.stack || 'No Traceback'}</p>`;
        } else {

            // Call the response header constants to write the html
            html += `${RESPONSE_HEADER_MESSAGES[ '500' ]}</h1>`;
        }

        this.html = html;
    }

    /**
     * @desc Sets up the headers associated with the ErrorResponse
     * @since 0.4.0
     * @access private
     */
    head() {
        this.response.writeHead(
            500,
            RESPONSE_HEADER_MESSAGES[ '500' ],
            this.responseHeaders
        );
        return this;
    }

    /**
     * @desc Writes the 500 html to the response.
     * @since 0.4.0
     * @access private
     */
    write() {
        let me = this;

        return new Promise(function(resolve) {
            me.writeSync();
            resolve();
        });
    }

    /**
     * @desc Writes the 500 html to the response synchronously.
     * @since 0.4.0
     * @access private
     */
    writeSync() {
        this.response.write(this.html);
    }
}

class $CustomResponse extends BaseResponse {

    head(code = 200, msg, headers = {}) {
        code = +code;
        msg = msg || RESPONSE_HEADER_MESSAGES[ +code ] || 'Unknown Error';

        this.response.writeHead(
            code, msg, util._extend(this.responseHeaders, {})
        );

        return this;
    }

    write(data) {
        let me = this;

        return new Promise(function(resolve) {
            me.writeSync(data);
            resolve();
        });
    }

    writeSync(data) {
        this.response.write(data);
    }
}

// TODO this will be done with the RESTful work
// class ControllerViewRequest extends ControllerRequest {
//     constructor() {
//
//     }
// }

/**
 * @desc Resolves any situation in which a Controller is referenced where it
 * does not exist
 * @since 0.4.0
 * @access private
 * @extends {Reference}
 */
class $$ControllerNotFoundError extends ReferenceError {

    /**
     * @param {string} name Controller Name
     * @since 0.4.0
     * @access private
     */
    constructor(name) {
        $LogProvider.error(`Unknown Controller ${blue(name)}`);
        super();
    }
}

// Performs the templating inside of Controller Classes
function controllerTemplateRouteResponse() {
    if (!this.template) {

        // Template was not found and we need to go into the catch function
        throw new Error();
    } else {
        let match = this.template.toString().match(/!doctype ([a-z]+)/i),
            mime;

        // In the context where MIME type is not set, but we have a
        // DOCTYPE tag, we can force set the MIME
        // We want this here instead of the explicit template definition
        // in case the MIME failed earlier
        if (match && !this.responseHeaders.hasOwnProperty('Content-Type')) {
            mime = this.responseHeaders[ 'Content-Type' ] =
                $MimeType.$$(match[1].toLowerCase());
        }

        // Check to see if this is an HTML template and has a DOCTYPE
        // and that the proper configuration options are set
        if (
            mime === 'text/html' &&
            config.loadDefaultScriptFile &&
            (
                this.route.hasOwnProperty('useDefaultScriptFile') ||
                this.route.useDefaultScriptFile !== false
            )
        ) {

            // Check that option is not true
            let scriptFile = config.loadDefaultScriptFile === true ?
                'application.js' : config.loadDefaultScriptFile;
            $resourceLoader(scriptFile);
        }

        // Pull the response back in from wherever it was before
        this.responseContent = this.response.$responseContent;

        // Render the template into the resoponse
        let me = this;
        return new Promise(function(resolve) {

            // $Compile to parse template strings and app.directives
            return $compile(me.template)(

                // In the context of the scope
                me.$scope
            ).then(function(template) {
                resolve(template);
            });
        }).then(function(template) {
            me.response.$responseContent = me.responseContent += template;
            me.response.write(me.responseContent);
        });
    }
}

export default $Response;
export {
    BaseResponse,
    AssetResponse,
    ControllerTemplateResponse,
    ControllerTemplatePathResponse,
    RedirectResponse,
    UnknownResponse,
    ErrorResponse,
    $CustomResponse
};