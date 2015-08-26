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

        // Parse out the response content type
        contentType = this.request.headers.accept;
        if (contentType && contentType.indexOf(',') > -1) {
            contentType = contentType.split(',')[0];
        } else {
            contentType = $MimeType.fromPath(path);
        }

        // this.responseContentType = contentType;

        this.responseHeaders = {
            'Content-Type': this.responseContentType = contentType
        };

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

export default $Request;