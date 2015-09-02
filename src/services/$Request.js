/**
 * @module $Request.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
import url from                     'url';

// Angie Modules
import {default as $Routes} from    '../factories/$RouteProvider';
import * as $Responses from         './$Response';
import $Util, {$StringUtil} from    '../util/Util';

/**
 * @desc The $Request class processes all of the incoming Angie requests. It
 * can be required using a module import, but probably should not be unless it
 * is being subclassed for a dependency package. It can also be used as an
 * injected provider using `$request`.
 * @since 0.0.1
 * @access public
 * @example $Injector.get('$request');
 */
class $Request {
    constructor(request) {

        // Define $Request based instance of createServer.prototype.response
        this.request = request;

        // Define URI
        this.url = this.request.url = request.url;
        this.path = this.request.path = url.parse(request.url).pathname;

        // Parse query params out of the url
        this.query = this.request.query = url.parse(request.url, true).query;

        // Declare the routes on the request object
        this.routes = $Routes.fetch().routes;
        this.otherwise = $Routes.fetch().otherwise;
    }

    /**
     * @desc Returns a rerouted request which will perform a site redirect on
     * the front end.
     * @since 0.4.0
     * @param {string} path The relative or absolute path to which the Response
     * is redirected.
     * @access public
     * @example $Injector.get('$request').$redirect('test');
     */
    $redirect(path) {
        return new $Responses.RedirectResponse(path).head().write();
    }

    /**
     * @desc Performs the routing of all Angie requests
     * @since 0.4.0
     * @access private
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

        // Route the request based on whether the route exists and what the
        // route states its response should contain.
        let ResponseType;

        try {
            if (this.route) {
                if (this.route.template && this.route.template.length) {
                    ResponseType = 'ControllerTemplate';
                } else if (this.route.templatePath) {
                    ResponseType = 'ControllerTemplatePath';
                } else {
                    ResponseType = 'Asset';
                }
            } else if (this.otherwise) {
                ResponseType = 'Redirect';
            } else {
                ResponseType = this.path === '/' ? 'Base' : 'Unknown';
            }

            // Perform the specified response type
            if (ResponseType) {
                console.log(ResponseType);
                return new $Responses[ `${ResponseType}Response` ]().head().write();
            } else {
                throw new Error();
            }
        } catch(e) {

            // Throw an error response if no other response type was specified
            new $Responses.ErrorResponse(e).head.write();
        }
    }
}

export default $Request;