'use strict';

import angular from '../Angular';

export default function compile(t) {

    if (!t) {
        return angular.noop;
    }

    let template = t.toString(),

        // TODO you will have to modify this for punctuation
        listeners = template.match(/\{{3}[a-zA-z0-9]+\}{3}/g) || [];

    // TODO this is pretty basic for now, does not handle expressions
    // TODO expressions
    // TODO controllers & directives
    // TODO when you fix scope, fix this as well

    /* eslint-disable */
    return function templateCompile (scope) {

        // Temporary template object, lets us hang on to our template
        let tmpLet = template;

    /* eslint-enable */
        if (listeners && listeners.length) {
            listeners.forEach(function(listener) {
                let val,

                    // TODO this will have to be modified when you are listening inside a
                    // template
                    parsedListener = listener.replace(/(\{|\})/g, '').trim();

                try {

                    /* eslint-disable */
                    val = eval(`scope.${parsedListener}`) || '';

                    /* eslint-enable */
                } catch(e) {} // Moot error, if it's not there, try something else

                // TODO this will have to be modified when you are listening inside a
                // template
                tmpLet = tmpLet.replace(listener, val);
            });
        }
        return tmpLet;
    };
}


// TODO you may just want to patch in the Angular compile and listen on {{{}}}
// TODO you also need to parse child scopes
// TODO use handlebars and then angular
