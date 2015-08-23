/**
 * @module BaseRequest.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _angieLog = require('angie-log');

var _angieLog2 = _interopRequireDefault(_angieLog);

var _angieInjector = require('angie-injector');

// Angie Modules

var _Angie = require('../Angie');

var _Angie2 = _interopRequireDefault(_Angie);

var _Config = require('../Config');

var _$Request = require('./$Request');

var _$Request2 = _interopRequireDefault(_$Request);

var _$Responses = require('./$Responses');

var _factories$RouteProvider = require('../factories/$RouteProvider');

var _factories$RouteProvider2 = _interopRequireDefault(_factories$RouteProvider);

var _factories$TemplateCache = require('../factories/$TemplateCache');

var _factories$Compile = require('../factories/$Compile');

var _factories$Compile2 = _interopRequireDefault(_factories$Compile);

var _util$MimeTypeProvider = require('../util/$MimeTypeProvider');

var _util$MimeTypeProvider2 = _interopRequireDefault(_util$MimeTypeProvider);

var _utilUtil = require('../util/Util');

var _utilUtil2 = _interopRequireDefault(_utilUtil);

_Angie2['default'].constant('RESPONSE_HEADER_MESSAGES', {
    200: 'OK',
    404: 'File Not Found',
    500: 'Invalid Request'
}).constant('PRAGMA_HEADER', 'no-cache').constant('NO_CACHE_HEADER', 'private, no-cache, no-store, must-revalidate');

/**
 * @desc The BaseRequest class processes all of the incoming Angie requests. It
 * can be required using a module import, but probably should not be unless it
 * it being subclassed for a dependency package.
 * @todo Make this class private ($$)
 * @todo Move base request
 * @since 0.0.1
 */

var BaseRequest = (function () {
    function BaseRequest(path, request, response) {
        _classCallCheck(this, BaseRequest);

        // Shortcut to set and receive the request object
        this.request = new _$Request2['default'](request).request;

        // Define URI
        this.path = this.request.path = path;

        // Make the response object available to the API
        this.response = new _$Responses.$Response(response).response;
        this.response.$responseContent = '';

        // Parse out the response content type
        var contentType = this.request.headers.accept;

        if (contentType && contentType.indexOf(',') > -1) {
            contentType = contentType.split(',')[0];
        } else {
            contentType = _util$MimeTypeProvider2['default'].fromPath(path);
        }

        this.responseContentType = contentType;
        this.responseHeaders = {
            'Content-Type': this.responseContentType
        };

        // Grab the routes and the otherwise
        this.routes = _factories$RouteProvider2['default'].fetch().routes;
        this.otherwise = _factories$RouteProvider2['default'].fetch().otherwise;
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

    _createClass(BaseRequest, [{
        key: '$$route',
        value: function $$route() {

            // Check against all of the RegExp routes in Reverse
            var regExpRoutes = [];
            if (this.routes.regExp) {
                regExpRoutes = Object.keys(this.routes.regExp).reverse();
            }

            for (var i = 0; i < regExpRoutes.length; ++i) {

                // Slice characters we do not need to instantiate a new RegExp
                var regExpRoute = _utilUtil.$StringUtil.removeTrailingLeadingSlashes(regExpRoutes[i]),

                // Cast the string key of the routes.regExp object as a
                // RegExp obj
                pattern = new RegExp(regExpRoute);

                if (pattern.test(this.path)) {
                    this.route = this.routes.regExp[regExpRoutes[i]];

                    // Hooray, we've set our route, now we need to do some additional
                    // param parsing
                    _utilUtil2['default']._extend(this.request.query, _factories$RouteProvider2['default'].$$parseURLParams(pattern, this.path));

                    break;
                }
            }

            // Check for a matching string path
            if (!this.route && this.routes[this.path]) {
                this.route = this.routes[this.path];
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
         *
         * If the loadDefaultScriptFile option is added to AngieFile.json with a
         * valid (existing and of type ".js") JavaScript filename, this default
         * script file will be loaded.
         * @todo add documentation on views
         * @since 0.2.3
         * @access private
         */
    }, {
        key: '$controllerPath',
        value: function $controllerPath() {
            var me = this,
                prom = undefined;

            // TODO move all of this out to responses
            prom = new Promise(function (resolve, reject) {

                // TODO despite the fact that controllerName is kind of a misnomer,
                // because this can be a function, it is ok for now
                var controllerName = me.route.Controller;

                // Get controller and compile scope
                if (controllerName) {
                    if (_Angie2['default'].Controllers[controllerName] || typeof controllerName === 'function') {

                        // Check to see if the Controller in the Route is a function
                        var controller = typeof me.route.Controller !== 'function' ? _Angie2['default'].Controllers[controllerName] : controllerName;

                        _Angie2['default'].Controller = _Angie2['default'].services.$response.Controller = {
                            done: resolve
                        };

                        me.controller = new _angieInjector.$injectionBinder(controller, 'controller').call(_Angie2['default'].services.$scope, resolve);
                        if (!me.controller || !me.controller.constructor || me.controller.constructor.name !== 'Promise') {
                            resolve(controllerName);
                        }
                    } else {

                        // TODO controller was not found despite being defined?
                        // TODO exception
                        reject('No Controller named "' + controllerName + '" could be found');
                    }
                } else {
                    resolve(controllerName);
                }
            });

            // Find and load template
            prom = prom.then(function (controllerName) {
                var mime = undefined;

                if (me.route.template && typeof me.route.template === 'string' && me.route.template.length > 0) {
                    me.template = me.route.template;
                } else if (me.route.templatePath) {
                    var template = _factories$TemplateCache.$templateCache.get(me.route.templatePath);

                    // Check to see if we can associate the template path with a
                    // mime type
                    mime = _util$MimeTypeProvider2['default'].fromPath(me.route.templatePath);

                    // Check the caching options for static assets
                    // This should only be for templatePaths with "."'s,
                    // all others should apply to caching options
                    if (me.route.templatePath.indexOf('.') > -1 && _Config.config.hasOwnProperty('cacheStaticAssets') && !_Config.config.cacheStaticAssets) {

                        // If there is a template, check to see if caching is set
                        me.responseHeaders = _utilUtil2['default']._extend(me.responseHeaders, {
                            Expires: -1,
                            Pragma: _Angie2['default'].constants.PRAGMA_HEADER,
                            'Cache-Control': _Angie2['default'].constants.NO_CACHE_HEADER
                        });
                    }

                    me.responseHeaders['Content-Type'] = mime;
                    me.template = template;
                }

                // If there is a template/templatePath defined we should have a template
                if (!me.template) {
                    if (me.route.template || me.route.templatePath) {
                        return me.unknownPath();
                    }
                } else {

                    // If we have any sort of template
                    var match = undefined;

                    // In the context where MIME type is not set, but we have a
                    // DOCTYPE tag, we can force set the MIME
                    // We want this here instead of the explicit template definition
                    // in case the MIME failed earlier
                    if (match = me.template.toString().match(/!doctype ([a-z]+)/i)) {
                        mime = me.responseHeaders['Content-Type'] = _util$MimeTypeProvider2['default'].$$(match[1].toLowerCase());
                    }

                    // Check to see if this is an HTML template and has a DOCTYPE
                    // and that the proper configuration options are set
                    if ((mime || me.responseHeaders['Content-Type']) === 'text/html' && _Config.config.loadDefaultScriptFile && (!me.route.hasOwnProperty('useMainScriptFile') || me.route.useDefaultScriptFile !== false)) {

                        console.log('IM IN!!!');

                        // Check that option is not true
                        var scriptFile = _Config.config.loadDefaultScriptFile === true ? 'application.js' : _Config.config.loadDefaultScriptFile;
                        (0, _factories$TemplateCache.$resourceLoader)(scriptFile);
                    }

                    // Pull the response back in from wherever it was before
                    me.responseContent = me.response.$responseContent;

                    // Render the template into the resoponse
                    return new Promise(function (resolve) {

                        // $Compile to parse template strings and app.directives
                        return (0, _factories$Compile2['default'])(me.template)(

                        // In the context of the scope
                        _Angie2['default'].services.$scope).then(function (template) {
                            resolve(template);
                        });
                    }).then(function (template) {
                        me.responseContent += template;
                        me.response.$responseContent = me.responseContent;

                        return controllerName;
                    });
                }
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

            prom.then(function () {
                me.response.writeHead(200, _Angie2['default'].constants.RESPONSE_HEADER_MESSAGES['200'], me.responseHeaders);
                me.response.write(me.responseContent);
            });

            prom['catch'](function (e) {
                _angieLog2['default'].error(e);
                return me.errorPath();
            });

            return prom;
        }
    }, {
        key: 'otherPath',
        value: function otherPath() {
            var me = this;

            if (this.otherwise) {

                // Redirect the page to a default page
                // TODO test otherwise redirects to absolute path or full link
                return new Promise(function () {
                    me.response.statusCode = 302;
                    me.response.setHeader('Location', '' + me.otherwise);
                    arguments[0]();
                });
            }

            return this[(this.path === '/' ? 'default' : 'unknown') + 'Path']();
        }
    }, {
        key: 'defaultPath',
        value: function defaultPath() {

            // Load default page
            var index = (0, _factories$TemplateCache.$$templateLoader)('index.html');

            // If the index page could not be found
            if (!index) {
                return this.unknownPath();
            }

            // Write the response
            var me = this;
            return new Promise(function () {
                me.response.writeHead(200, _Angie2['default'].constants.RESPONSE_HEADER_MESSAGES['200'], me.responseHeaders);
                me.response.write(index);
                arguments[0]();
            });
        }
    }, {
        key: 'unknownPath',
        value: function unknownPath() {

            // Load page not found
            var fourOhFour = (0, _factories$TemplateCache.$$templateLoader)('404.html'),
                me = this;

            return new Promise(function () {
                me.response.writeHead(404, _Angie2['default'].constants.RESPONSE_HEADER_MESSAGES['404'], me.responseHeaders);
                me.response.write(fourOhFour);
            });
        }
    }, {
        key: 'errorPath',
        value: function errorPath() {
            this.response.writeHead(500, _Angie2['default'].constants.RESPONSE_HEADER_MESSAGES['500'], this.responseHeaders);
            this.response.write('<h1>' + _Angie2['default'].constants.RESPONSE_HEADER_MESSAGES['500'] + '</h1>');
        }
    }]);

    return BaseRequest;
})();

exports.BaseRequest = BaseRequest;

// TODO break up this file
// BaseRequest
// ControllerRequest
// ControllerWithTemplate
// ControllerWithTemplatePath
// ControllerWithView
// UnkownRequest
// ErrorRequest