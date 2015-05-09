'use strict'

import $log from './util/$LogProvider';

const fs =            require('fs'),
      chalk =         require('chalk');

const p = process;

let config = {};

export default class Config {
    constructor() {
        if (Object.keys(config).length === 0) {
            return new Promise(function(resolve, reject) {

                // TODO different cases of AngieFile, angiefile, angieFile, Angiefile, angie_file
                try {
                    resolve(fs.readFileSync('AngieFile.json', 'utf8'));
                } catch(e) {
                    reject(e);
                }
            }).then(function(stdout) {
                try {
                    config = JSON.parse(stdout);
                } catch(e) {
                    $log.error(e);
                    p.exit(1);
                }
            }, function(e) {
                $log.error(e);
                p.exit(1);
            });
        } else {
            return new Promise(resolve => resolve());
        }
    }
    // static __forceSet__(obj) {
    //     config = obj;
    // }
    static fetch() {
        return config;
    }
}

export {config};

// TODO what if it is not a linux machine?
