'use strict'; 'use strong';

import util from './util/util';
import $log from './util/$LogProvider';
import $ExceptionsProvider from './util/$ExceptionsProvider';

const fs =            require('fs');

const p = process;

let config = {};

export default class Config {
    constructor() {
        if (Object.keys(config).length === 0) {
            return new Promise(function() {

                // Use the file finder to check against filetype
                let fileNames = [
                        'angiefile',
                        'angieFile',
                        'Angiefile',
                        'AngieFile'
                    ],
                    acceptedFileNames = [],
                    file;

                fileNames.forEach(function(name) {
                    acceptedFileNames.push(`${name}.json`);
                    acceptedFileNames.push(`${name}.js`);
                    acceptedFileNames.push(`${name}.es6`);
                });

                acceptedFileNames.forEach(function(name) {
                    let tmpFile = util.findFile(p.cwd(), name);
                    if (tmpFile) {
                        file = tmpFile;
                    }
                });

                try {
                    arguments[0](fs.readFileSync(file, 'utf8'));
                } catch(e) {
                    arguments[1](e);
                }
            }).then(function(stdout) {
                try {
                    config = JSON.parse(stdout);
                } catch(e) {
                    $ExceptionsProvider.$$invalidConfig();
                }
            }, function(e) {
                $ExceptionsProvider.$$invalidConfig();
            });
        } else {
            return new Promise(() => arguments[0]());
        }
    }
}

export {config};
