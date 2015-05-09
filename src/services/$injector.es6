'use strict';

import app from '../Base';
import $log from '../util/$LogProvider';

const chalk =       require('chalk');

const $injector = {
    get: function() {
        if (!arguments.length) {
            $$injectorErr();
        }

        let providers = [];
        for (let i = 0; i < arguments.length; ++i) {
            let arg = arguments[i].trim(),
                provision;

            try {
                provision = app[app.__registry__[arg]][arg];
            } catch (e) {
                $$providerErr(e, arg);
            }
            if (provision && $injector[`${typeof provision}Check`](provision)) {
                providers.push(provision);
            } else {
                $$providerErr(null, arg);
            }
        }
        return providers.length > 1 ? providers : providers[0];
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
    numberCheck(n) {
        return true;
    }
};

function $injectionBinder() {
    try {
        let str = v.fn.toString(),
            args = str.match(/(function.*\(.*\))/g),
            providers = [];

        if (args && args.length) {
            args = args[0].replace(/(function\s+\(|\))/g, '').split(',');
            providers = app.services.$injector.get.apply(app, args);
        }

        return providers.length ? v.fn(...providers) : v.fn(providers);
    } catch(e) {
        new v.fn();
    }
}

function $$inejectorErr() {
    $log.error('Injector cannot be called without a provider name');
    p.exit(1);
}

function $$providerErr(e, arg) {
    $log.error(`Cannot find ${arg} <-- ${arg}Provider ${e}`);
    p.exit(1);
}

export default $injector;
export {$injectionBinder};

// TODO we can still do this better
// TODO this should probably include a function that parses the arguments as well
