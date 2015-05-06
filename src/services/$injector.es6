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

            if (typeof provision === 'function' || typeof provision === 'object') {
                providers.push(provision);
            } else {
                $$providerErr(null, arg);
            }
        }
        return providers;
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
