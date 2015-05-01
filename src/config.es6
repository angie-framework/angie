'use strict'

const exec =          require('child_process').exec,
      chalk =         require('chalk');

const p = process;

let config = undefined;

export default class Config {
    constructor() {
        console.log(chalk.bold(chalk.green('Build Config')));
        if (!config) {
            return new Promise(function(resolve, reject) {
                console.log(chalk.bold(chalk.green('Read Settings File')));
                exec(`find . -name 'AngieFile.json' -exec cat {} \\;`,
                    function(e, stdout) {
                        if (stdout) {
                            resolve(stdout)
                        } else {
                            reject(e);
                        }
                    }
                );
            }).then(function(stdout) {
                try {
                    config = JSON.parse(stdout);
                } catch(e) {
                    console.log(chalk.bold(chalk.red(`ANGIE [Error]: ${e}`)));
                    p.exit(1);
                }
            }, function(e) {
                config = {};
                if (e) {
                    console.log(chalk.bold(chalk.red(`ANGIE [Error]: ${e}`)));
                } else {
                    console.log(chalk.bold(chalk.red(`ANGIE [Error]: No AngieFile Found.`)));
                }
                p.exit(1);
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
