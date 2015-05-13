'use strict';

import angular from '../Angular';

export default function compile(t) {

    if (!t) {
        return angular.noop;
    }

    // TODO do you want to use triple brackets here?
    let template = t.toString(),
        listeners = template.match(/\{\{\{.*\}\}\}/g);

    // TODO this is pretty basic for now, does not handle expressions
    // TODO expressions
    // TODO controllers & directives
    // TODO when you fix scope, fix this as well

    /* eslint-disable */
    return function templateCompile (scope) {

    /* eslint-enable */
        if (listeners && listeners.length) {
            listeners.forEach(function(listener) {
                let val,
                    parsedListener = listener.replace(/(\{|\})/g, '').trim();

                try {

                    /* eslint-disable */
                    val = eval(`scope.${parsedListener}`) || '';

                    /* eslint-enable */
                } catch(e) {} // Moot error, if it's not there, try something else

                template = template.replace(listener, val);
            });
        }
        return template;
    };
}


// TODO you may just want to patch in the Angular compile and listen on {{{}}}
// TODO you also need to parse child scopes
// TODO use handlebars and then angular
