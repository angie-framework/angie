'use strict'

import $log from './util/$LogProvider';

const exec =          require('child_process').exec,
      chalk =         require('chalk');

const p = process;

let config = {};

export default class Config {
    constructor() {
        if (Object.keys(config).length === 0) {
            return new Promise(function(resolve, reject) {
                exec(`find . -name 'AngieFile.json' -exec cat {} \\;`,
                    function(e, stdout) {
                        if (stdout) {
                            resolve(stdout);
                        } else {
                            reject(e);
                        }
                    }
                );
            }).then(function(stdout) {
                try {
                    config = JSON.parse(stdout);
                } catch(e) {
                    $log.error(`${e}`);
                    p.exit(1);
                }
            }, function(e) {
                config = {};
                if (e) {
                    $log.error(`${e}`);
                } else {
                    $log.error('No AngieFile Found.');
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
