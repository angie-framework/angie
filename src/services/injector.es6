'use strict';

import app from '../Angular';

const chalk =       require('chalk');

const $injector = {
    get: function() {
        for (let key in arguments) {
            console.log(app);
            let name = arguments[key],
                provision;
            if (app.__registry__.__configs__.indexOf(name) > -1) {
                provision = app.Configs[name];
            } else if (app.__registry__.__services__.indexOf(name) > -1) {
                console.log(name);
                provision = app.services[name];
            } else if (app.__registry__.__controllers__.indexOf(name) > -1) {
                provision = app.Controllers[name];
            } else if (app.__registry__.__models__.indexOf(name) > -1) {
                provision = app.Models[name];
            } else if (app.__registry__.__directives__.indexOf(name) > -1) {
                provision = app.directives[name];
            } else {
                console.log(chalk.bold(chalk.red(
                    `Angie: [Error] $injector could not find ${name} <-- ${name}Provider`
                )));
            }

            if (typeof provision === 'function' || typeof provision === 'object') {
                providers.push(provision);
            } else {
                console.log(chalk.bold(chalk.red(
                    `Angie: [Error] ${name}Provider not registered`
                )));
            }
        }
        console.log('providers', providers);
        return providers;
    }
};

export default $injector;

// TODO we can still do this better
