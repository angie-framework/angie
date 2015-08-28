/**
 * @module $Response.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
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
        [ request, this.response ]  = $Injector.get('$response', '$request');

        // Parse out the response content type
        contentType = request.headers.accept;
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
        this.response.write($$templateLoader('index.html'));
    }
}

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
    write() {
        const request = $Injector.get('$request');
        let assetCache = new $CacheFactory('staticAssets'),
            asset = this.response.$responseContent =
                assetCache.get(request.path) ||
                    $$templateLoader(request.path, 'static') || undefined;

        if (asset) {
            if (
                config.hasOwnProperty('cacheStaticAssets') &&
                !config.cacheStaticAssets
            ) {
                assetCache.put(request.path, asset);
            }
            this.response.write(asset);
        } else {
            new UnknownResponse().head().write();
        }
    }
}

// TODO should do directive work
class ControllerResponse extends BaseResponse {
    constructor() {
        super();
    }
    head() {
        super.head();
        return this;
    }
    write() {
        let $scope = $Injector.get('$scope'),
            me = this;

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
            me.controller = new $injectionBinder(
                controller,
                'controller'
            ).call($scope, resolve);

            // Resolve the Promise if the controller does not return a
            // function
            if (
                !me.controller.constructor ||
                me.controller.constructor.name !== 'Promise'
            ) {
                return resolve(controller);
            }
        });
    }
}

// TODO should call super for directive work
class ControllerTemplateResponse extends ControllerResponse {
    constructor() {
        super();
    }
    head() {
        super.head();
        return this;
    }
    write() {
        let me = this;

        return super.write().then(function() {
            me.template = me.route.template;
        }).then(
            controllerTemplateRouteResponse.bind(this)
        ).catch(controllerTemplateRouteError.bind(this));
    }
}

// TODO should call super for directive work
class ControllerTemplatePathResponse extends ControllerResponse {
    constructor() {
        super();
    }
    head() {
        super.head();
        return this;
    }
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
        ).catch(controllerTemplateRouteError.bind(this));
    }
}

class RedirectResponse extends BaseResponse {
    constructor(path) {
        super();
        this.path = path || $Injector.get('$request').otherwise;
    }
    head() {
        this.response.statusCode = 302;
        this.response.setHeader('Location', `${this.path}`);
        return this;
    }
    write() {

        // There is no content in this method
    }
}

class UnknownResponse extends BaseResponse {
    constructor() {
        super();
        this.html = $$templateLoader('404.html');
    }
    head() {
        this.response.writeHead(
            404,
            app.constants.RESPONSE_HEADER_MESSAGES['404'],
            this.responseHeaders
        );
        return this;
    }
    write() {
        this.response.write(this.html);
    }
}

class ErrorResponse extends BaseResponse {
    constructor() {
        super();
        this.html = `<h1>${RESPONSE_HEADER_MESSAGES[ '500' ]}</h1>`;
    }
    head() {
        this.response.writeHead(
            500,
            RESPONSE_HEADER_MESSAGES[ '500' ],
            this.responseHeaders
        );
        return this;
    }
    write() {
        this.response.write(this.html);
    }
}

// TODO this will be done with the RESTful work
// class ControllerViewRequest extends ControllerRequest {
//     constructor() {
//
//     }
// }

class $$ControllerNotFoundError extends ReferenceError {
    constructor(name) {
        $LogProvider.error(`Unknown Controller ${blue(name)}`);
        super();
    }
}

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
                this.route.hasOwnProperty('useMainScriptFile') ||
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
            let $scope = $Injector.get('$scope');

            // $Compile to parse template strings and app.directives
            return $compile(me.template)(

                // In the context of the scope
                $scope
            ).then(function(template) {
                resolve(template);
            });
        }).then(function(template) {
            me.response.$responseContent = me.responseContent += template;
            me.response.write(me.responseContent);
        });
    }
}

function controllerTemplateRouteError() {
    new ErrorResponse().head().write();
}

export default $Response;
export {
    BaseResponse,
    AssetResponse,
    ControllerTemplateResponse,
    ControllerTemplatePathResponse,
    UnknownResponse,
    ErrorResponse
};
