'use strict';

export default function compile(t) {

    // TODO do you want to use triple brackets here?
    let template = t,
        listeners = template.match(/\{\{.*\}\}/g);

    // TODO this is pretty basic for now, does not handle expressions
    // TODO expressions
    // TODO controllers & directives
    // TODO when you fix scope, fix this as well
    return function templateCompile (scope) {
        listeners.forEach(function(listener) {
            let val,
                parsedListener = listener.replace(/(\{|\})/g, '').trim();

            try {
                val = eval(`scope.${parsedListener}`);
            } catch(e) {} // Moot error, if it's not there, try something else

            if (val) {
                template = template.replace(listener, val);
                return;
            }
        });
        return template;
    }
};


// TODO you may just want to patch in the Angular compile and listen on {{{}}}
// TODO you also need to parse child scopes
// TODO use handlebars and then angular
