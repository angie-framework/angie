'use strict'; 'use strong';

import util from '../util/util';

let routes = {
        '/': {
            templatePath: 'index.html'
        },
        '/404': {
            templatePath: '404.html'
        },
        '/500': {
            templatePath: '404.html'
        },
        regExp: {}
    },
    otherwise;

/**
 * @desc $RouteProvider is provided to any service, Controller, directive, Model,
 * or view which has included it as an argument.
 *
 * It can also be referenced as `app.services.$routeProvider`.
 * @since 0.0.1
 */
class $RouteProvider {

    /**
     * @desc Sets up a route as a possible endpoint in an Angie application..
     * @since 0.0.1
     * @param {string|Object} str String or RegExp to denote the endpoint
     * path
     * @param {Object} obj
     * @param {?string} obj.templatePath Optional template path
     * @param {?string} obj.template Optional template html
     * @param {?string} obj.Controller The name of the associated Controller
     * @returns {function} Template function, compiles in whatever scope is passed
     * @example $routeProvider.when('/test', {
     *     template: '<div>{{{test}}}</div>',
     *     Controller: 'TestCtrl'
     * });
     */
    static when(str, obj) {
        if (str.constructor.name === 'RegExp') {
            routes.regExp[ str ] = obj;
        } else {
            routes[ str ] = obj;
        }
        return this;
    }
    static otherwise(str) {
        otherwise = str;
        return this;
    }
    static fetch() {
        return {
            routes: routes,
            otherwise: otherwise
        };
    }

    /**
     * @desc $RouteProvider._parseUrlParams is a function that will strip the
     * paramters out of RegExp pattern routes
     *
     * It is a private method
     * @since 0.2.3
     * @param {string} t Template string to be processed
     * @returns {function} Template function, compiles in whatever scope is passed
     * @example $compile('{{{test}}}')({ test: 1 }) === 1; // true
     */
    static _parseURLParams(pattern, path) {
        let obj = {};

        // If and only if the pattern and path exist
        if (pattern && path) {

            // Strip slashes
            util.removeTrailingLeadingSlashes(
                path.replace(pattern, '$1|$2|$3|$4|$5')
            ).split('|').forEach(

                // Pull the paramter from the parsed replace string if there is
                // a match
                function(v, i) {
                    if (v.indexOf(`$${i + 1}`) === -1) {
                        obj[ i ] = v;
                    }
                }
            );
        }

        // Param keys are matched indices and flagged with keys 0-5
        return obj;
    }
}

export {$RouteProvider as $routeProvider};
