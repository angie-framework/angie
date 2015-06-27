'use strict'; 'use strong';

// System Modules
import fs from                          'fs';

// Angie Modules
import util from                        './util/util';
import {default as $Exceptions} from    './util/$ExceptionsProvider';

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
                    let tmpFile = util.findFile(process.cwd(), name);
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
                    $Exceptions.$$invalidConfig();
                }
            }, function() {
                $Exceptions.$$invalidConfig();
            });
        } else {
            return new Promise(() => arguments[0]());
        }
    }
}

export {config};
