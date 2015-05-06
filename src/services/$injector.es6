'use strict';

import $log from '../util/$LogProvider';

const chalk =       require('chalk');

const $injector = {
    get: function() {
        let providers = [];
        for (let i = 0; i < arguments.length; ++i) {
            console.log(arguments[i]);
            let name = arguments[i],
                provision = this[this.__registry__[name]][name];
            if (typeof provision === 'function' || typeof provision === 'object') {
                providers.push(provision);
            } else {
                $log.error(
                    `Angie: [Error] Cannot find ${name} <-- ${name}Provider`
                );
            }
        }
        console.log(providers);
        return providers;
    }
};

export default $injector;

// TODO we can still do this better
