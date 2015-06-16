'use strict'; 'use strong';

import angular from '../Angular';
import app from '../Base';
import $log from '../util/$LogProvider';

import parse5 from 'parse5';

const parse = new parse5.Parser();

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

    for (let directive in app.directives) {

        let underscoreName = directive.replace(/[A-Z]/g, '_$1').toLowerCase(),
            dashName = directive.replace(/[A-Z]/g, '-$1').toLowerCase();

        // Add references back to the original directive from the aliases
        directiveKeys[ underscoreName ] = directiveKeys[ dashName ]
            directive;

        // Check for directives specifically by the name
        directives = directives.concat(
            template.match(directive) || [],
            template.match(underscoreName) || [],
            template.match(dashName) || []
        );
    }

    /**
     * @desc Function returned by $compile
     * @since 0.2.2
     * @param {object} scope [param={}] Template string to be processed
     * @returns {string} The compiled template
     */
    return function _templateCompile (scope = {}) {

        // Temporary template object, lets us hang on to our template
        let tmpLet = template;

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
        const dirs = app.directives;
        directives.forEach(function(directive) {

            // Reference to the directive in the scope of the app
            const directiveObj = dirs[ directive ] || dirs[ directiveKeys[ directive] ];

            // Find the first index of the container
            let index = tmpLet.indexOf(directive),
                firstIndex = _htmlCapstoneCheck(tmpLet, '<', index),
                lastIndex = _htmlCapstoneCheck(tmpLet, '>', index),
                el = tmpLet.substring(firstIndex, lastIndex + 1),
                attrs = {};


            console.log(el);
            // Get el node
            if (el) {
                el = parse.parseFragment(el);
                console.log(el);
                el = el.childNodes[0];
                attrs = el.attrs;
            }

            // Check to see if our directive is in a place we can handle it
            // Restrict



            // Replace the entire element or add to it?
            // Replace
            tmpLet = tmpLet.replace(directive, 'HI');

            // Pass as element

            // Parse any attrs

            // Fire link function: scope, el, attrs
        });

        return tmpLet;
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

function _htmlCapstoneCheck(str, capstone, i) {
    if (str[ i ] === capstone) {
        return i;
    }
    return _htmlCapstoneCheck(str, capstone, i + (capstone === '<' ? -1 : 1));
}

export default $compile;
