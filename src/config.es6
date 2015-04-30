'use strict'

const exec =          require('child_process').exec,
      chalk =         require('chalk');

let config = undefined;

export default class Config {
    constructor() {
        console.log('in');
        console.log(chalk.bold(chalk.green('Build Config')));
        if (!config) {
            return new Promise(function(resolve, reject) {
                console.log(chalk.bold(chalk.green('Read Settings File')));
                exec(`find ${__dirname} -type f -exec cat 'AngieFile.json' '{}' \\;`,
                    function(e, stdout) {
                        console.log(stdout);
                        return e ? reject(e) : resolve(stdout);
                    }
                );
            }).then(function(stdout) {
                //console.log(stdout);
                config = JSON.parse(stdout);
                console.log(config);
            }, function(e) {
                config = {};
                throw new Error(`ANGIE [Error]: ${e}`);
            });
        } else {
            return new Promise(resolve => resolve());
        }
    }
    static __forceSet__(obj) {
        config = obj;
    }
    static fetch() {
        return config;
    }
}

// TODO what if it is not a linux machine?
