'use strict'; 'use strong';

// Angie Modules
import {default as $Exceptions} from                '../util/$ExceptionsProvider';
import $log from                                    '../util/$LogProvider';

class $Injector {
    get() {
        if (!arguments.length) {
            $Exceptions.$$providerError();
        }

        let providers = [];

        // TODO improve spacing
        for (let i = 0; i < arguments.length; ++i) {
            let arg = arguments[i].trim(),
                provision;

            if (!arg || !arg.length) {

                // I don't think that this warrants a hard return, maybe just
                // odd spacing
                $log.warn('Invalid spacing found in $injector');
                continue;
            } else if (arg === 'scope') {
                arg = '$scope';
            }

            try {
                provision = global.app[ global.app._registry[ arg ] ][ arg ];
            } catch (e) {

                // TODO should result in a 500
                $Exceptions.$$providerError(arg);
            }
            if (provision && $injector[ `${typeof provision}Check` ](provision)) {
                providers.push(provision);
            } else {

                // TODO should result in a 500
                $Exceptions.$$providerError(arg);
            }
        }
        return providers.length > 1 ? providers : providers[0] ? providers[0] : [];
    }
    stringCheck(s) {
        return !!s.length;
    }
    objectCheck(o) {
        return !!Object.keys(o).length;
    }
    functionCheck() {
        return true;
    }
    booleanCheck() {
        return true;
    }
    numberCheck() {
        return true;
    }
}

function $injectionBinder(fn) {
    let str = fn.toString(),
        args = str.match(/(function.*\(.*\))/g),
        providers = [];

    args.forEach((v) => v.replace(/\s/g, ''));

    if (args && args.length) {
        args = args[0].replace(/(function\s+\(|\))/g, '').split(',');
        providers = $injector.get.apply(global.app, args);
    }
    return providers.length ? fn.bind(null, ...providers) : fn.bind(null, providers);
}

const $injector = new $Injector();
export default $injector;
export {$injectionBinder};

// TODO we can still do this better
