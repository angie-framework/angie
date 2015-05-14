'use strict';

import app from '../Base';
import $log from '../util/$LogProvider';

const p = process;

const $injector = {
    get: function() {
        if (!arguments.length) {
            $$injectorErr();
        }

        let providers = [];
        for (let i = 0; i < arguments.length; ++i) {
            let arg = arguments[i].trim(),
                provision;

            if (!arg || !arg.length) {

                // I don't think that this warrants a hard return, maybe just
                // odd spacing
                // TODO write a test around this
                $log.warn('Invalid spacing found in $injector');
                continue;
            } else if (arg === '$scope') {
                arg = 'scope';
            }

            try {
                provision = app[app.__registry__[arg]][arg];
            } catch (e) {
                $$providerErr(e, arg);
            }
            if (provision && $injector[ `${typeof provision}Check` ](provision)) {
                providers.push(provision);
            } else {
                $$providerErr(null, arg);
            }
        }
        return providers.length > 1 ? providers : providers[0] ? providers[0] : [];
    },
    stringCheck(s) {
        return !!s.length;
    },
    objectCheck(o) {
        return !!Object.keys(o).length;
    },
    functionCheck() {
        return true;
    },
    booleanCheck() {
        return true;
    },
    numberCheck() {
        return true;
    }
};

function $injectionBinder(fn) {
    try {
        let str = fn.toString(),
            args = str.match(/(function.*\(.*\))/g),
            providers = [];

        args.forEach((v) => v.replace(/\s+/g, ''));

        if (args && args.length) {
            args = args[0].replace(/(function\s+\(|\))/g, '').split(',');
            providers = $injector.get.apply(app, args);
        }
        return providers.length ? fn.bind(null, ...providers) : fn.bind(null, providers);
    } catch(e) {
        $$providerErr(e);
    }
}

function $$injectorErr() {
    $log.error('Injector cannot be called without a provider name');
    p.exit(1);
}

function $$providerErr(e, arg) {
    $log.error(
        arg ? `Cannot find ${arg} <-- ${arg}Provider ${e}` : e
    );
    p.exit(1);
}

export default $injector;
export {$injectionBinder};

// TODO we can still do this better
// TODO this should probably include a function that parses the arguments as well
