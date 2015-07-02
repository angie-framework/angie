'use strict'; 'use strong';

// Angie Modules
import {default as $Exceptions} from    '../util/$ExceptionsProvider';

class $InjectorProvider {
    static get() {
        let providers = [],
            args = arguments[0] instanceof Array ?
                arguments[0] : Array.from(arguments);

        if (args.length && args[0] === '') {
            args.shift();
        }

        for (let i = 0; i < args.length; ++i) {
            let arg = args[i].trim(),
                provision;

            if (arg === 'scope') {
                arg = '$scope';
            }

            let registrar;
            if ((registrar = global.app[ global.app._registry[ arg ] ])) {
                provision = registrar[ arg ];
            }

            if (
                provision &&
                $InjectorProvider[ `_${typeof provision}Check` ](provision)
            ) {
                providers.push(provision);
            } else {
                $Exceptions.$$providerError(arg);
            }
        }
        return providers.length > 1 ? providers : providers[0] ? providers[0] : [];
    }

    // TODO you can use util for this - NodeJS builtins
    static _stringCheck(s) {
        return !!(s + '');
    }
    static _objectCheck(o) {
        return !!Object.keys(o).length;
    }
    static _functionCheck() {
        return true;
    }
    static _booleanCheck() {
        return true;
    }
    static _numberCheck() {
        return true;
    }
}

function $injectionBinder(fn) {
    let str = fn.toString(),
        args = str.match(/(function.*\(.*\))/g),
        providers = [];

    args.forEach((v) => v.replace(/\s/g, ''));
    if (args && args.length) {

        // TODO this is probably one of the worst RegExps ever written. It is
        // intended to match:
        // Anonymous functions
        // Named functions
        // Arrow functions
        // Closing brackets
        args = args[0].replace(
            /(\(|function(\s+)?([^\)\(]+)?(\s+)?\(|\)(\s+)?(=>)?(\s+)?)/g,
            ''
        ).split(',').map((v) => v.trim());
        providers = $InjectorProvider.get.apply(global.app, args);
    }
    return typeof providers === 'object' ?
        fn.bind(null, ...providers) : providers ?
            fn.bind(null, providers) : fn.bind(null);
}

export default $InjectorProvider;
export {$injectionBinder};