/**
 * @module Config.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
import fs from                          'fs';

// Angie Modules
import { $$InvalidConfigError } from    './services/$Exceptions';
import $Util, { $FileUtil } from        './util/util';

const CWD = process.cwd();
let config = {};

/**
 * @desc Instantiates the class that loads the AngieFile configs. This is an
 * internal class and the very first part of the application that is loaded.
 * None of the application will load if the AngieFile is missing or invalid.
 * Valid names for this file are "angiefile" with any mixed case written as
 * JSON or a JavaScript file (".js" or ".es6") that exports a JavaScript object.
 * @since 0.0.1
 * @access private
 */
class Config {

    /**
     * @desc Loads the AngieFile by name and parses its content
     * @since 0.0.1
     * @access private
     */
    constructor() {

        // Define the possible names for our config
        let fileNames = [
                'angiefile',
                'angieFile',
                'Angiefile',
                'AngieFile'
            ],
            acceptedFileNames = [],
            file,
            ext,
            content;
        fileNames.forEach(function(name) {

            // Add .es6 just in case we have lingering .es6 file users
            acceptedFileNames.push(`${name}.json`, `${name}.js`, `${name}.es6`);
        });

        // Cycle through all of the possible filenames, stopping on the first
        // match
        for (let i = acceptedFileNames.length - 1; i >= 0; --i) {

            // Check to see if we can find the absolute path to our configs
            file = $FileUtil.find(process.cwd(), acceptedFileNames[ i ]);
            if (file) {

                // Get the file extension, so we know how to parse the configs
                ext = file.split('.').pop();
                break;
            }
        }

        try {
            if (ext === 'json') {
                config = JSON.parse(fs.readFileSync(file, 'utf8'));
            } else {
                config = require(file);
            }
        } catch(e) {
            throw new $$InvalidConfigError();
        } finally {
            if (Object.keys(config).length) {
                if (!$Util.isArray(config.templateDirs)) {
                    config.templateDirs = [];
                }

                if (!$Util.isArray(config.staticDirs)) {
                    config.staticDirs = [];
                }

                // Set the template and static dirs to something if they do not
                // exist
                config.templateDirs = $Util.toSet(
                    config.templateDirs.map(v => {
                        if (v.indexOf(CWD) === -1) {
                            v = `${CWD}/${v}`;
                        }
                        return v;
                    })
                ).add(`${__dirname}/../templates`);

                config.staticDirs = $Util.toSet(
                    config.staticDirs.map(v => {
                        if (v.indexOf(CWD) === -1) {
                            v = `${CWD}/${v}`;
                        }
                        return v;
                    })
                ).add(`${__dirname}/../static`);

                config.loadDefaultScriptFile = new Set(
                    $Util.toArray(config.loadDefaultScriptFile)
                );
            } else {
                throw new $$InvalidConfigError();
            }
        }
    }
}

// Instantiate application configs based on AngieFile
new Config();

export default Config;
export { config };

// TODO add top level angie static/templates
// TODO fix routing of subs