'use strict';

import $log from '../util/$LogProvider';

const chalk =       require('chalk');

const $injector = {
    get: function() {
        let providers = [];
        for (let i = 0; i < arguments.length; ++i) {
            let arg = arguments[i].trim(),
                provision;

            try {
                provision = this[this.__registry__[arg]][arg];
            } catch (e) {
                $$providerErr(e, arg);
            }
            if (provision && $injector[`${typeof provision}Check`](provision)) {
                providers.push(provision);
            } else {
                $$providerErr(null, arg);
            }
        }
        return providers;
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

function $parse(s) {}

function $$providerErr(e, arg) {
    $log.error(`Cannot find ${arg} <-- ${arg}Provider ${e}`);
    p.exit(1);
}

export default $injector;

// TODO we can still do this better
// TODO this should probably include a function that parses the arguments as well
