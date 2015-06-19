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
            type,
            proms = [];

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
            return directives.forEach(function(directive) {

                //console.log(directive._names);

                proms.push(new Promise(
                    _processDirective.bind(null, el, directive)
                ));

                // TODO To parse many directives, call this function several times
                if (el.childNodes && el.childNodes.length) {
                    let els = el.childNodes;
                    for (let i = 0; i < els.length; ++i) {
                        fn(els[ i ]);
                    }
                }
            });
        };

        if ($document.body) {
            fn($document.body);
        }

        console.log(proms.length);

        return Promise.all(proms).then(function() {
            console.log('All proms returned');
            if ($document.body) {
                tmpLet = `<!DOCTYPE html>\n${$document.documentElement.outerHTML}`;
            }
            app.services.$window = app.services.$document = {};
            return tmpLet;
        });
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

function _processDirective(el, directive, resolve, reject) {
    let replace = (d) =>
            el.outerHTML = d.replace ? el.innerHTML : el.outerHTML,
        pass = false,
        type;

    //console.log(el.nodeType, el.tagName, el.innerHTML, el.className);

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
        el.attributes &&
        directive._names.some((v) => !!(el.attributes[ v ]))
    ) {
        type = 'A';
    } else if (el.tagName && directive._names.indexOf(el.tagName) > -1) {
        type = 'E';
    }

    //console.log('here', type);

    if (
        type && directive.hasOwnProperty('restrict') &&
        directive.restrict.indexOf(type) === -1
    ) {
        return resolve();
    }

    //console.log('here2', type, pass);

    if (type && !pass) {

        // Templating
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
                    el.setAttribute(
                        util.toDash(change.name),
                        change.object[ change.name ]
                    );
                }
            });
        });

        console.log('here 3', directive.link);

        // Link functionality
        if (
            directive.hasOwnProperty('link') &&
            typeof directive.link === 'function'
        ) {
            return new Promise(directive.link.bind(
                app.services.$scope,
                app.services.$scope,
                type !== 'M' ? el : null,
                parsedAttrs
            )).then(function() {
                console.log('IN THE THEN');
                //console.log('here4');
                replace(directive);
                resolve();
            });
        } else {
            //replace(directive);
            resolve();
        }
    } else {
        //console.log('here 5', resolve);
        resolve();
    }
}

export default $compile;
