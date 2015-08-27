/**
 * @module $Request.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
import url from                     'url';

// Angie Modules
import app from                     '../Angie';
import {default as $Routes} from    '../factories/$RouteProvider';
import {* as $Responses} from       './$Response';
import $Util, {$StringUtil} from    '../util/Util';

// TODO this has to be instantiated from outside the class
class $Request {
    constructor(request) {
        let contentType;

        // Define $Request based instance of createServer.prototype.response
        this.request = request;

        // Define URI
        this.url = this.request.url = request.url;
        this.path = this.request.path = url.parse(request.url).pathname;

        // Parse query params out of the url
        this.request.query = url.parse(request.url, true).query;

        // Declare the routes on the request object
        this.routes = $Routes.fetch().routes;
        this.otherwise = $Routes.fetch().otherwise;
    }
    $redirect(path) {
        return new RedirectResponse(path).head().write();
    }
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
        let ResponseType;
        if (this.route) {
            if (this.route.template && this.route.template.length) {
                ResponseType = 'ControllerTemplate';
            } else if (this.route.templatePath) {
                ResponseType += 'ControllerTemplatePath';
            } else {
                ResponseType = 'Asset';
            }
        } else if (this.otherwise) {
            ResponseType = 'Redirect';
        } else {
            ResponseType = this.path === '/' ? 'Base' : 'Unknown';
        }

        if (ResponseType) {
            return new $Responses[ `${ResponseType}Response` ]().head().write();
        }

        // We may or may not need this...just in case
        return new ErrorResponse().head.write();
    }
}

export default $Request;