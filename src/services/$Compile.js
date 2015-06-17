'use strict'; 'use strong';

import angular from '../Angular';
import app from '../Base';
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

    for (let directive in app.directives) {
        let underscoreName = directive.replace(/([A-Z])/g, '_$1').toLowerCase(),
            dashName = directive.replace(/([A-Z])/g, '-$1').toLowerCase();

        // Add references back to the original directive from the aliases
        directiveKeys[ underscoreName ] = directiveKeys[ dashName ] =
            directive;

        // Add all parsed directve names to directives
        directives = directives.concat([ directive, underscoreName, dashName ]);
    }

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
        const dirs = app.directives;
        $document = parser(tmpLet, {
            FetchExternalResources: [],
            ProcessExternalResources: false
        });
        $window = d.defaultView;

        app.service('$window', $window);
        app.service('$document', $document);

        // d.querySelectorAll('*[]')
        const fn = function parseChildNodes(el) {
            // Check to see if there is a directive in any of the types

            // If there is a directive or many, parse it
            // To parse many directives, call this function several times
        };

        // We can now tear down our $document service
        app._tearDown('$window');
        app._tearDown('$document');

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

// // Reference to the directive in the scope of the app
// const directiveObj = dirs[ directive ] || dirs[ directiveKeys[ directive] ];
//
// // Find the first index of the container
// let index = tmpLet.indexOf(directive),
//     firstIndex = _htmlCapstoneCheck(tmpLet, '<', index),
//     lastIndex = _htmlCapstoneCheck(tmpLet, '>', index),
//     el = tmpLet.substring(firstIndex, lastIndex + 1),
//     parsedEl,
//     attrs = {},
//     type;
//
// // Get el node
// if (el) {
//     parsedEl = parse.parseFragment(el).childNodes[0];
//     attrs = parsedEl.attrs;
// }
//
// // Find out where we are trying to render this directive
// if (parsedEl.nodeName === '#comment') {
//     type = 'M';
// } else if (parsedEl.nodeName === 'div') {
//     attrs.forEach(function(v) {
//         if (v.name === 'class' && v.value.indexOf(directive) > -1) {
//             type = 'C';
//         } else if (v.name === directive) {
//             type = 'A';
//         }
//     });
// } else {
//     type = 'E';
// }
//
// // Check to see if our directive is in a place we can handle it
// // Restrict
// if (
//     directiveObj.hasOwnProperty('restrict') &&
//     directiveObj.restrict.indexOf(type) === -1
// ) {
//     return;
// }
//
// // Execute Link function
// if (
//     directiveObj.hasOwnProperty('link') &&
//     typeof directiveObj === 'function'
// ) {
//
//     // TODO does this need to happen asynchronously?
//     directiveObj.link.call(
//         app.services.$scope,
//         app.services.$scope,
//         type !== 'M' ? el : null,
//         attrs
//     );
// }
//
//
//
// // Replace the entire element or add to it?
// // Replace
// if (directive.hasOwnProperty('replace')) {
//     let pattern = new RegExp(`${el}.*${parsedEl.nodeName.index}`)
//     tmpLet = tmpLet.replace(el, 'HI');
// }
//
//
// // Pass as element
//
// // Parse any attrs
//
// // Fire link function: scope, el, attrs


// function _htmlCapstoneCheck(str, capstone, i) {
//     if (str[ i ] === capstone) {
//         return i;
//     }
//     return _htmlCapstoneCheck(str, capstone, i + (capstone === '<' ? -1 : 1));
// }

export default $compile;
