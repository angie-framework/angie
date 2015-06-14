'use strict'; 'use strong';

import angular from '../Angular';
import app from '../Base';
import $log from '../util/$LogProvider';

/**
 * @desc $compile is provided to any service, Controller, directive, Model, or view
 * which has included it as an argument.
 *
 * It can also be referenced as `app.services.$compile`.
 * @since 0.2.2
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
        directives = [];

    for (let directive in app.directives) {
        directives = directives.concat(template.match(directive) || []);
    }

    /**
     * @desc Function returned by $compile
     * @since 0.2.2
     * @param {object} scope [param={}] Template string to be processed
     * @returns {string} The compiled template
     */
    return function _templateCompile (scope = {}) {

        console.log(scope);

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
        directives.forEach(function(directive) {
            console.log(directive);

            // Check to see if our directive is in a place we can handle it
            // Restrict
            // Parse arguments: attrs? element? scope?
            // Fire link function
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
        keyStr += `let ${key}=${val};`;
    }

    // TODO This can be improved if keyStr is evaluated beforehand
    // Literal eval is executed in its own context here to reduce security issues
    /* eslint-disable */
    return eval([ keyStr, str ].join(';'));

    /* eslint-enable */
}

export default $compile;
