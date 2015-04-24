'use strict'

const exec =        require('child_process').exec,
    chalk =         require('chalk');

let config = undefined;

export default class Config {
    constructor() {
        console.log(chalk.bold(chalk.green('Build Config')));
        if (!config) {
            return new Promise(function(resolve, reject) {
                console.log(chalk.bold(chalk.green('Read Settings File')));
                exec('find . -type f -exec cat \'AngieFile.json\' \'{}\' \\;', function(e, stdout) {
                    return e ? reject(e) : resolve(stdout);
                });
            }).then(function(stdout) {
                config = JSON.parse(stdout);
            }, function(e) {
                config = {};
                throw new Error(`ANGIE [Error]: ${e}`);
            });
        } else {
            return new Promise();
        }
    }
    static fetch() {
        return config;
    }
}
