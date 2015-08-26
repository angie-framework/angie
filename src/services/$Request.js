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

// TODO this has to be instantiated from outside the class
class $Request {
    constructor(path, request, response) {
        let contentType;

        // Define $Request based instance of createServer.prototype.response
        this.request = request;

        // Define URI
        this.path = this.request.path = path;

        // Parse query params out of the url
        this.request.query = url.parse(request.url, true).query;

        // Declare the routes on the request object
        this.routes = $Routes.fetch().routes;
        this.otherwise = $Routes.fetch().otherwise;
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

        // TODO we have to replace these with request types

        // Route the request based on whether the route exists
        if (this.route) {
            return this.$controllerPath();
        }
        return this.otherPath();
    }
}

// TODO does this all belong in the $Request file?

// TODO this will be done with the RESTful work
// class ControllerViewRequest extends ControllerRequest {
//     constructor() {
//
//     }
// }

// TODO this should contain methods specific to providing content, type, headers, etc

export default $Request;