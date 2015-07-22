'use strict'; 'use strong';

// System Modules
import {jsdom} from             'jsdom';
import $LogProvider from        'angie-log';

// Angie Modules
import app, {Angie} from        '../Angie';
import {$$templateLoader} from  './$TemplateCache';
import {$StringUtil} from       '../util/Util';

// ngie Incrementer
let iid = 0;

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
class $window {}

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
        return Angie.noop;
    }

    // We need to call template.toString() because we did not load with utf8
    let template = t.toString(),
        listeners = template.match(/\{{3}[^\}]+\}{3}/g) || [],
        directives = [];

    // Direct reference by directive name to directive object
    for (let $directive in app.directives) {
        let directive = app.directives[ $directive ];
        directive.$names = [
            $directive,
            $StringUtil.toUnderscore($directive),
            StringUtil.toDash($directive)
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
     * @param {boolean} assignDOMServices [param=true] Create a new
     * $window/$document?
     * @returns {string} The compiled template
     */
    return function $templateCompile (scope = {}, assignDOMServices = true) {

        // Temporary template object, lets us hang on to our template
        let tmpLet = template,
            proms = [];

        // Parse simple listeners/expressions
        listeners.forEach(function(listener) {

            // Remove the bracket mustaches
            let parsedListener = listener.replace(/(\{|\}|\;)/g, '').trim(),
                val = '';

            // Evaluate the expression
            try {
                val = $$evalFn.call(scope, parsedListener);
            } catch(e) {
                $LogProvider.warn(e);
            }

            // Change the scope of the template
            tmpLet = tmpLet.replace(listener, val);
        });

        // Parse directives
        let $$document,
            $$window;
        try {
            $$document = jsdom(tmpLet, {
                FetchExternalResources: [],
                ProcessExternalResources: false
            });
            $$window = $$document.defaultView;
        } catch(e) {
            $LogProvider.error(e);
        }

        // Assign the window and document services
        if (assignDOMServices === true) {
            app.service('$window', $$window).service('$document', $$document);
        }

        if ($$document.body) {
            let els = $$document.body.querySelectorAll('*');
            for (let i = 0; i < els.length; ++i) {
                let el = els[ i ],
                    type,
                    prom;
                directives.forEach(function(directive) {

                    // Try and match a directive based on type
                    if (
                        el.classList &&
                        directive.$names.some((v) => el.classList.contains(v))
                    ) {
                        type = 'C';
                    } else if (
                        el.hasAttribute &&
                        directive.$names.some((v) => !!(el.hasAttribute(v)))
                    ) {
                        type = 'A';
                    } else if (
                        el.tagName &&
                        directive.$names.indexOf(el.tagName.toLowerCase()) > -1
                    ) {
                        type = 'E';
                    }

                    // Check that the restriction is valid
                    if (
                        type && (
                            !directive.hasOwnProperty('restrict') ||
                            (
                                directive.hasOwnProperty('restrict') &&
                                directive.restrict.indexOf(type) > -1
                            )
                        )
                    ) {
                        prom = $$processDirective(
                            $$document,
                            el,
                            scope,
                            directive,
                            type
                        );
                        proms.push(prom);
                    }
                });
            }
        }

        return Promise.all(proms).then(function() {

            // Check for a document.body in tmpLet
            if (tmpLet.indexOf('<body') > -1 && tmpLet.indexOf('/body>') > -1) {
                tmpLet = `<!DOCTYPE html>\n${$$document.documentElement.outerHTML}`;
            } else {

                // Or return just the string
                tmpLet = $$document.body.innerHTML;
            }

            app.services.$window = app.services.$document = {};
            return tmpLet;
        });
    };
}

// A private function to evaluate the parsed template string in the context of
// `scope`
function $$evalFn(str) {
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

    // Literal eval is executed in its own context here to reduce security issues
    /* eslint-disable */
    return eval([ keyStr, str ].join(''));

    /* eslint-enable */
}

// Private function responsible for parsing directives
function $$processDirective($$document, el, scope, directive, type) {
    let template,
        prom;

    // Template parsing
    if (
        directive.hasOwnProperty('templatePath') &&
        directive.templatePath.indexOf('.html') > -1
    ) {
        template = $$templateLoader(directive.templatePath, 'template', 'utf8');
    } else if (directive.hasOwnProperty('template')) {
        template = directive.template;
    }

    if (template) {

        // Setup the template HTML observing the prepend/append properties
        prom = $compile(template)(scope, false).then(function(t) {
            el.innerHTML =
                `${directive.prepend === true ? '' : el.innerHTML}${t}` +
                `${directive.prepend !== true ? '' : el.innerHTML}`;
        });
    } else {
        prom = new Promise((r) => r());
    }

    // Setup Attrs
    let attrs = el.attributes || {},
        parsedAttrs = {};
    if (el.hasAttribute && el.getAttribute) {
        for (let key in attrs) {
            if (el.hasAttribute(key)) {
                parsedAttrs[ $StringUtil.toCamel(key) ] = el.getAttribute(key);
            }
        }
    }

    // Link functionality
    if (
        directive.hasOwnProperty('link') &&
        typeof directive.link === 'function'
    ) {
        prom = prom.then(function() {
            return new Promise(directive.link.bind(
                app.services.$scope,
                app.services.$scope,
                type !== 'M' ? el : null,
                parsedAttrs
            ));
        }).then(function() {

            // TODO an Observance model would be way better
            if (el.setAttribute) {
                for (let key in parsedAttrs) {

                    // Replace all of the element attrs with parsedAttrs
                    if (directive.$names.indexOf(key) === -1) {
                        el.setAttribute($StringUtil.toDash(key), parsedAttrs[ key ]);
                    }
                }
            }
        });
    }

    // Replace directive keyword
    prom.then(function() {
        if (directive.replace === true) {
            el.setAttribute('ngie-id', ++iid);
            $$document.body.innerHTML = $$document.body.innerHTML.replace(
                el.outerHTML,
                el.innerHTML
            );
        }
    });

    return prom;
}

export default $compile;
