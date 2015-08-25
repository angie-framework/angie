/**
 * @module Config.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
import fs from                          'fs';

// Angie Modules
import {$FileUtil} from                 './util/Util';
import {$$InvalidConfigError} from      './util/$ExceptionsProvider';

let config = {};

class Config {
    constructor() {
        if (Object.keys(config).length === 0) {
            return new Promise(function(resolve, reject) {

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
                    let tmpFile = $FileUtil.find(process.cwd(), name);
                    if (tmpFile) {
                        file = tmpFile;
                    }
                });

                try {
                    resolve(fs.readFileSync(file, 'utf8'));
                } catch(e) {
                    reject(e);
                }
            }).then(function(stdout) {
                config = JSON.parse(stdout);
                if (global.app) {
                    global.app.$$config = Object.freeze(config);
                }
            }).catch(() => { throw new $$InvalidConfigError(); });
        } else {
            return new Promise(() => arguments[0]());
        }
    }
}

export default Config;
export {config};
