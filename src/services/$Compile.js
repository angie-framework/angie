'use strict'; 'use strong';

import angular from '../Angular';
import app from '../Base';
import {$templateLoader} from './$TemplateCache';
import util from '../util/util';
import $log from '../util/$LogProvider';

import jsdom from 'jsdom';

const parser = jsdom.jsdom;

/**
 * @desc $window is provided to any directive which has included it. It
 * is a NodeJS representation of a window object.
 *
 * This should not be used to transform window properties as the window
 * provided by the browser and $window are not the same instance.
 *
 * @since 0.2.3
 * @access public
 * @example new $window.HTMLElement('div');
 */
class $window {}

/**
 * @desc $document is provided to any directive which has included it. It
 * is a NodeJS representation of a window.document object.
 *
 * This should not be used to transform document properties as the document
 * provided by the browser and $document are not the same instance.
 *
 * @since 0.2.3
 * @access public
 * @example new $window.HTMLElement('div');
 */
class $document{}

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
function $compile(t) {

    if (!t) {
        return angular.noop;
    }

    // We need to call template.toString() because we did not load with utf8
    let template = t.toString(),
        listeners = template.match(/\{{3}[^\}]+\}{3}/g) || [],

        // Match on directives
        directiveKeys = {},
        directives = [];

    // TODO Reference directive objects everywhere here, dir.name, and reference all
    // containers from there
    for (let _directive in app.directives) {
        let directive = app.directives[ _directive ];
        directive._names = [
            _directive,
            util.toUnderscore(_directive),
            util.toDash(_directive)
        ];

        // Add all parsed directve names to directives
        directives.push(directive);
    }

    // Sort our directives for priority
    directives.sort(function(a, b) {
        if (!a.priority && !b.priority) {
            return 0;
        }
        return (a.priority && !b.priority) || (a.priority > b.priority) ? 1 : -1;
    });

    /**
     * @desc Function returned by $compile
     * @since 0.2.2
     * @param {object} scope [param={}] Template string to be processed
     * @returns {string} The compiled template
     */
    return function _templateCompile (scope = {}) {

        // Temporary template object, lets us hang on to our template
        let tmpLet = template,
            type;

        // Parse simple listeners/expressions
        listeners.forEach(function(listener) {

            // Remove the bracket mustaches
            let parsedListener = listener.replace(/(\{|\}|\;)/g, '').trim(),
                val = '';

            // Evaluate the expression
            try {
                val = _evalFn.call(scope, parsedListener);
            } catch(e) {
                $log.warn(e);
            }

            // Change the scope of the template
            tmpLet = tmpLet.replace(listener, val);
        });

        // Parse directives
        // TODO make sure every directive actually gets replaced
        try {
            $document = parser(tmpLet, {
                FetchExternalResources: [],
                ProcessExternalResources: false
            });
            $window = $document.defaultView;
        } catch(e) {}

        app.service.$window = $window;
        app.service.$document = $document;

        const fn = function parseChildNodes(el) {

                // Check to see if there is a directive in any of the types
                directives.forEach(function(directive) {
                    let pass = false,
                        type;

                    if (
                        el.nodeType === 8 && el.innerHTML &&
                        directive._names.some((v) => el.innerHTML.indexOf(v) > -1)
                    ) {
                        type = 'M';
                    } else if (
                        el.className &&
                        directive._names.some((v) => el.className.indexOf(v) > -1)
                    ) {
                        type = 'C';
                    } else if (
                        directive._names.some((v) => !!(el.attributes && el.attributes[ v ]))
                    ) {
                        type = 'A';
                    } else if (directive._names.indexOf(el.tagName) > -1) {
                        type = 'E';
                    }

                    if (
                        type && directive.hasOwnProperty('restrict') &&
                        directive.restrict.indexOf('type') === -1
                    ) {

                        // If children, we need to call them
                    }

                    if (type && !pass) {

                        // Templating
                        // TODO commonize
                        // TODO is this related to replace?
                        if (
                            directive.hasOwnProperty('templatePath') &&
                            directive.templatePath.indexOf('.html') > -1
                        ) {
                            el.innerHTML += $templateLoader(path);
                        } else if (directive.hasOwnProperty('template')) {
                            el.innerHTML += directive.template;
                        }

                        // Watch attrs
                        let attrs = el.attributes || {},
                            parsedAttrs = {};
                        for (let attr in attrs) {
                            let attrName = util.toCamel(attr);
                            parsedAttrs[ attrName ] = attrs[ attr ];
                        }

                        Object.observe(parsedAttrs, function(changes) {
                            changes.forEach(function(change) {
                                if (
                                    el.setAttribute && change.name &&
                                    change.object && change.object[ change.name ]
                                ) {

                                    console.log(util.toDash(change.name));
                                    console.log(change.object[ change.name ]);
                                    el.setAttribute(
                                        util.toDash(change.name),
                                        change.object[ change.name ]
                                    );
                                    console.log(el.outerHTML);
                                    el.innerHTML = 'BLAH BLAH BLAH';
                                }
                            });
                        });

                        // Link functionality
                        if (
                            directive.hasOwnProperty('link') &&
                            typeof directive.link === 'function'
                        ) {

                            // TODO does this need to happen asynchronously?
                            directive.link.call(
                                app.services.$scope,
                                app.services.$scope,
                                type !== 'M' ? el : null,
                                parsedAttrs
                            );
                        }

                        // Replace
                        // TODO revisit this: does it replace existing children or
                        // does it replace the top level element
                        if (directive.replace) {
                            el.outerHTML = el.innerHTML;
                        }
                    }

                    if (el.childNodes) {
                        let els;
                        for (let node in (els = el.childNodes)) {
                            fn(els[ node ]);
                        }
                    }
                    return;
                });

                // If there is a directive or many, parse it
                // To parse many directives, call this function several times
            };
        if ($document.body) {
            fn($document.body);
        }

        console.log('HTML', $document.querySelector('.footer').innerHTML)

        // We can now tear down our $document service
        app.services.$window = app.services.$document = {};
        return (tmpLet = $document.documentElement.innerHTML);
    };
}

// A private function to evaluate the parsed template string in the context of
// `scope`
function _evalFn(str) {
    let keyStr = '';

    // Perform any parsing that needs to be performed on the scope value
    for (let key in this) {
        let val = this[ key ];
        if (!val) {
            continue;
        } else if (typeof val === 'symbol' || typeof val === 'string') {
            val = `"${val}"`;
        } else if (typeof val === 'object') {
            val = JSON.stringify(val);
        }

        // I don't like having to use var here
        keyStr += `var ${key}=${val};`;
    }

    // TODO This can be improved if keyStr is evaluated beforehand
    // Literal eval is executed in its own context here to reduce security issues
    /* eslint-disable */
    return eval([ keyStr, str ].join(''));

    /* eslint-enable */
}

export default $compile;
