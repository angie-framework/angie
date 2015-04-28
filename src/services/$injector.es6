'use strict';

const chalk =       require('chalk');

const $injector = {
    get: function() {
        let providers = []
        for (let key in arguments) {
            let name = arguments[key],
                provision = this[this.__registry__[name]][name];
            if (typeof provision === 'function' || typeof provision === 'object') {
                providers.push(provision);
            } else {
                console.log(chalk.bold(chalk.red(
                    `Angie: [Error] Cannot find ${name} <-- ${name}Provider`
                )));
            }
        }
        return providers;
    }
};

export default $injector;

// TODO we can still do this better
