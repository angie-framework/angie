'use strict'; 'use strong';

// System Modules
import $LogProvider from    'angie-log';

// Angie Modules
import util from            '../util/util';

const IGNORE_KEYS = [
    'Controller',
    'template',
    'templatePath'
];
let routes = {
        '/': {
            templatePath: 'index.html'
        },
        '/404': {
            templatePath: '404.html'
        },
        '/500': {
            templatePath: '404.html'
        }
    },
    otherwise;

/**
 * @desc $RouteProvider is provided to any service, Controller, directive, Model,
 * or view which has included it as an argument as ""$Routes"
 *
 * It can also be referenced as `app.services.$Routes` or imported as
 * '$RouteProvider' from the Angie Path.
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
     * @param {?object} obj.* A deep route with another route object
     * to associate with a route consisting of the original path added to the
     * new key
     * @returns {function} Template function, compiles in whatever scope is
     * passed
     * @access public
     * @example $Routes.when('/test', {
     *     template: '<div>{{{test}}}</div>',
     *     Controller: 'TestCtrl',
     *     test2: {
     *         template: '<div>{{{test2}}}</div>',
               Controller: 'Test2Ctrl'
     *     }
     * });
     */
    static when(path, obj) {
        let regExpFlag = false;

        // Determine if the route is RegExp or not and register the route
        if (path.constructor.name === 'RegExp') {
            regExpFlag = true;

            // Set the route regExp identifier
            if (!routes.regExp) {
                routes.regExp = {};
            }

            // Set a RegExp route
            routes.regExp[ path ] = obj;
        } else {

            // Set a string route
            routes[ path ] = obj;
        }

        // Find any "deep" routes which we may want to add on to the root route
        Object.keys(obj).forEach(function(v) {
            let childPath,
                childObj = obj[ v ];

            // We're talking about a template or a Controller and we don't want
            // that
            // It's worth noting that return based "if"s in Coffee are pretty
            // dope
            if (IGNORE_KEYS.indexOf(v) > -1) {
                return;
            } else if (regExpFlag || /\/.*\//.test(v)) {

                // Check to see if we previously had or now have a path with
                // RegExp
                childPath = $RouteProvider.$stringsToRegExp(
                    path,
                    util.removeTrailingLeadingSlashes(v)
                );
            } else {

                // Concatenate two string paths
                childPath = [ path, v ].join('/').replace(/\/\//g, '/');
            }

            // If the child route does not have a Controller, force it to
            // it's parent inherit
            if (obj.Controller && !childObj.Controller) {
                childObj.Controller = obj.Controller;
            }

            // Set a route child object
            $RouteProvider.when(childPath, childObj);

            // Strip the child from the original route object
            delete obj[ v ];
        });
        return this;
    }

    /**
     * @desc Sets a defaulted path in the event that none of the other routes
     * or route patterns are matching. If this is a relative path, it will match
     * absolutely. If this is a full path, it will result in a 301 redirect.
     *
     * @since 0.0.1
     * @param {string} path URL string to set as the "otherwise" path
     * @returns {string} The same URL string
     * @access public
     * @example $Route.otherwise('/test');
     */
    static otherwise(path) {
        if (typeof path === 'string') {
            otherwise = path;
        } else {

            // Redirection can only occur based on this path if path is a string
            $LogProvider.warn(
                'Cannot set "otherwise" route to anything other than a string'
            );
        }
        return path;
    }

    /**
     * @desc Returns all of the set application routes
     * @since 0.0.1
     * @returns {object} Routes object (inc. RegExps) and otherwise path objects
     * @access public
     */
    static fetch() {
        let obj = { routes: routes };
        if (otherwise) {
            obj.otherwise = otherwise;
        }
        return obj;
    }

    /**
     * @desc $Routes.$$clear is a helper method designated to clear out all
     * of the routes in the test environment. Don't call it or you might have a
     * bad time.
     * @since 0.2.5
     * @access private
     * @example $Routes.$$clear() // routes = {};
     */
    static $$clear() {
        routes = {};
        otherwise = undefined;
    }

    /**
     * @desc Take RegExp literals or strings and return a new RexExp
     * @since 0.2.5
     * @param {string|object} str Arguments of strings or RegExp literals
     * @returns {object} Concatenated RegExps joined by "/"
     * @access private
     * @example var regExp = $Routes.$stringsToRegExp(/test/, test);
     *     regExp.test('test/test') === true;
     */
    static $stringsToRegExp() {
        return new RegExp(Array.prototype.slice.call(arguments).map((v) =>
            util.removeTrailingLeadingSlashes(v.toString())
        ).join('\\/'));
    }

    /**
     * @desc $Routes.$$parseURLParams is a function that will strip the
     * paramters out of RegExp pattern routes
     *
     * It is a private method
     * @since 0.2.3
     * @param {string} t Template string to be processed
     * @returns {function} Template function, compiles in whatever scope is passed
     * @access private
     * @example $compile('{{{test}}}')({ test: 1 }) === 1; // true
     */
    static $$parseURLParams(pattern, path) {
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

export default $RouteProvider;
