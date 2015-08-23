/**
 * @module $Compile.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _jsdom = require('jsdom');

var _angieLog = require('angie-log');

var _angieLog2 = _interopRequireDefault(_angieLog);

// Angie Modules

var _Angie = require('../Angie');

var _Angie2 = _interopRequireDefault(_Angie);

var _$TemplateCache = require('./$TemplateCache');

var _utilUtil = require('../util/Util');

var _utilUtil2 = _interopRequireDefault(_utilUtil);

// ngie Incrementer
var iid = 0;

/**
 * @desc $window is provided to any directive which has included it. It
 * is a NodeJS representation of a window object.
 *
 * This should not be used to transform window properties as the window
 * provided by the browser and $window are not the same instance.
 *
 * @since 0.2.4
 * @access public
 * @example new $window.HTMLElement('div');
 */

var $window = function $window() {
    _classCallCheck(this, $window);
}

/**
 * @desc $document is provided to any directive which has included it. It
 * is a NodeJS representation of a window.document object.
 *
 * This should not be used to transform document properties as the document
 * provided by the browser and $document are not the same instance.
 *
 * @since 0.2.4
 * @access public
 * @example new $window.HTMLElement('div');
 */
;

var $document = function $document() {
    _classCallCheck(this, $document);
}

/**
 * @desc $compile is provided to any service, Controller, directive, Model, or
 * view which has included it as an argument.
 *
 * $compile is responsible for parsing all templates and templatePath files that
 * are passed into a Controller. It will parse all triple bracketted statements,
 * all ngie-native directives, and all custom directives.
 *
 * The triple bracket statement is utilized as a result of the Angular/Mustache/
 * Handlebars standard of two brackets. While you can also do three brackets in
 * either of the latter cases, it is generally considered unsafe and most
 * definitely so in this case.
 *
 * Native directives are called "ngie" to avoid namespace collisions. Dirty
 * checking is performed on directive names for camelCasing,
 * underscore_separation, and dash-separation.
 *
 * It can also be referenced as `app.services.$compile`.
 * @since 0.2.2
 * @todo "No parse operator"
 * @param {string} t Template string to be processed
 * @returns {function} Template function, compiles in whatever scope is passed
 * @access public
 * @example $compile('{{{test}}}')({ test: 1 }) === 1; // true
 */
;

function $compile(t) {

    if (!t) {
        return _utilUtil2['default'].noop;
    }

    // We need to call template.toString() because we did not load with utf8
    var template = t.toString(),
        listeners = template.match(/\{{3}[^\}]+\}{3}/g) || [],
        directives = [];

    // Direct reference by directive name to directive object
    for (var $directive in _Angie2['default'].directives) {
        var directive = _Angie2['default'].directives[$directive];
        directive.$names = [$directive, _utilUtil.$StringUtil.toUnderscore($directive), _utilUtil.$StringUtil.toDash($directive)];

        // Add all parsed directve names to directives
        directives.push(directive);
    }

    // Sort our directives for priority
    directives.sort(function (a, b) {
        if (!a.priority && !b.priority) {
            return 0;
        }
        return a.priority && !b.priority || a.priority > b.priority ? 1 : -1;
    });

    /**
     * @desc Function returned by $compile
     * @since 0.2.2
     * @param {object} scope [param={}] Template string to be processed
     * @param {boolean} assignDOMServices [param=true] Create a new
     * $window/$document?
     * @returns {string} The compiled template
     */
    return function $templateCompile() {
        var scope = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
        var assignDOMServices = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

        // Temporary template object, lets us hang on to our template
        var tmpLet = template,
            proms = [];

        // Parse simple listeners/expressions
        listeners.forEach(function (listener) {

            // Remove the bracket mustaches
            var parsedListener = listener.replace(/(\{|\}|\;)/g, '').trim(),
                val = '';

            // Evaluate the expression
            try {
                val = $$evalFn.call(scope, parsedListener);
            } catch (e) {
                _angieLog2['default'].warn(e);
            }

            // Change the scope of the template
            tmpLet = tmpLet.replace(listener, val);
        });

        // Parse directives
        var $$document = undefined,
            $$window = undefined;
        try {
            $$document = (0, _jsdom.jsdom)(tmpLet, {
                FetchExternalResources: [],
                ProcessExternalResources: false
            });
            $$window = $$document.defaultView;
        } catch (e) {
            _angieLog2['default'].error(e);
        }

        // Assign the window and document services
        if (assignDOMServices === true) {
            _Angie2['default'].service('$window', $$window).service('$document', $$document);
        }

        if ($$document.body) {
            var els = $$document.body.querySelectorAll('*');

            var _loop = function (i) {
                var el = els[i],
                    type = undefined,
                    prom = undefined;
                directives.forEach(function (directive) {

                    // Try and match a directive based on type
                    // TODO classList is undefined in jsDOM, polyfill or find a better way
                    if (el.className && directive.$names.some(function (v) {
                        return el.className.indexOf(v) > -1;
                    })) {
                        type = 'C';
                    } else if (el.hasAttribute && directive.$names.some(function (v) {
                        return !!el.hasAttribute(v);
                    })) {
                        type = 'A';
                    } else if (el.tagName && directive.$names.indexOf(el.tagName.toLowerCase()) > -1) {
                        type = 'E';
                    }

                    // Check that the restriction is valid
                    if (type && (!directive.hasOwnProperty('restrict') || directive.hasOwnProperty('restrict') && directive.restrict.indexOf(type) > -1)) {
                        prom = $$processDirective($$document, el, scope, directive, type);
                        proms.push(prom);
                    }
                });
            };

            for (var i = 0; i < els.length; ++i) {
                _loop(i);
            }
        }

        return Promise.all(proms).then(function () {

            // Check for a document.body in tmpLet
            if (tmpLet.indexOf('<body') > -1 && tmpLet.indexOf('/body>') > -1) {
                tmpLet = '<!DOCTYPE html>\n' + $$document.documentElement.outerHTML;
            } else {

                // Or return just the string
                tmpLet = $$document.body.innerHTML;
            }

            _Angie2['default'].services.$window = _Angie2['default'].services.$document = {};
            return tmpLet;
        });
    };
}

// A private function to evaluate the parsed template string in the context of
// `scope`
function $$evalFn(str) {
    var keyStr = '';

    // Perform any parsing that needs to be performed on the scope value
    for (var key in this) {
        var val = this[key];
        if (!val) {
            continue;
        } else if (typeof val === 'symbol' || typeof val === 'string') {
            val = '"' + val + '"';
        } else if (typeof val === 'object') {
            val = JSON.stringify(val);
        }

        // I don't like having to use var here
        keyStr += 'var ' + key + '=' + val + ';';
    }

    // Literal eval is executed in its own context here to reduce security issues
    /* eslint-disable */
    return eval([keyStr, str].join(''));

    /* eslint-enable */
}

// Private function responsible for parsing directives
function $$processDirective($$document, el, scope, directive, type) {
    var template = undefined,
        prom = undefined;

    // Template parsing
    if (directive.hasOwnProperty('templatePath') && directive.templatePath.indexOf('.html') > -1) {
        template = (0, _$TemplateCache.$$templateLoader)(directive.templatePath, 'template', 'utf8');
    } else if (directive.hasOwnProperty('template')) {
        template = directive.template;
    }

    if (template) {

        // Setup the template HTML observing the prepend/append properties
        prom = $compile(template)(scope, false).then(function (t) {
            el.innerHTML = '' + (directive.prepend === true ? '' : el.innerHTML) + t + ('' + (directive.prepend !== true ? '' : el.innerHTML));
        });
    } else {
        prom = new Promise(function (r) {
            return r();
        });
    }

    // Setup Attrs
    var attrs = el.attributes || {},
        parsedAttrs = {};
    if (el.hasAttribute && el.getAttribute) {
        for (var key in attrs) {
            if (el.hasAttribute(key)) {
                parsedAttrs[_utilUtil.$StringUtil.toCamel(key)] = el.getAttribute(key);
            }
        }
    }

    // Link functionality
    if (directive.hasOwnProperty('link') && typeof directive.link === 'function') {
        prom = prom.then(function () {
            return new Promise(directive.link.bind(_Angie2['default'].services.$scope, _Angie2['default'].services.$scope, type !== 'M' ? el : null, parsedAttrs));
        }).then(function () {

            // TODO an Observance model would be way better
            if (el.setAttribute) {
                for (var key in parsedAttrs) {

                    // Replace all of the element attrs with parsedAttrs
                    if (directive.$names.indexOf(key) === -1) {
                        el.setAttribute(_utilUtil.$StringUtil.toDash(key), parsedAttrs[key]);
                    }
                }
            }
        });
    }

    // Replace directive keyword
    prom.then(function () {
        if (directive.replace === true) {
            el.setAttribute('ngie-id', ++iid);
            $$document.body.innerHTML = $$document.body.innerHTML.replace(el.outerHTML, el.innerHTML);
        }
    });

    return prom;
}

exports['default'] = $compile;
module.exports = exports['default'];