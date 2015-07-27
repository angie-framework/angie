'use strict'; 'use strong';

// System Modules
import fs from                          'fs';
import util from                        'util';
import $LogProvider from                'angie-log';

// Angie Modules
import {$StringUtil} from                '../Util';
import {$$ProjectCreationError} from    '../$ExceptionsProvider';

const p = process;

/**
 * @desc $$createProject is the function called when the CLI attempts to create
 * a project from the command line. Scaffolds the main folder in the specified
 * location or no folder and then folders for commonly used providers and the
 * Angie config file, AngieFile.json.
 *
 * This function will gracefully exit the process if successful and exit with
 * errors if unsuccessful.
 * @since 0.0.1
 * @param {object} args A list of arugments passed from the CLI parser
 * @param {string} args.name The name of the project being created. This must
 * consist of letters, dashes, & underscores
 * @param {string} args.location [param=process.cwd()] The location in which the
 * inner files of the project are created. CWD if no location is specified.
 * @access private
 */
export default function $$createProject(args = {}) {

    // Parse the passed arguments object
    const name = args.name,
          location = $StringUtil.removeTrailingLeadingSlashes(args.location);
    let mkDir,
        mkDirFiles,
        mkSub;

    // The process must exit if there is no passed name, or the name passed is
    // in an incorrect format
    if (!name) {
        throw new $$ProjectCreationError('No project name specified');
    } else if (
        /[0-9$%\^&*\)\(\<\>\\\/\.\,\`\?\+\!\~#@=\}\{\|\]\[\'\"\:\;]+/i.test(name)
    ) {

        // Being super specific about which characters are OK and which are not
        throw new $$ProjectCreationError(
            'Invalid project name: must be all letters, dashes, & underscores'
        );
    }

    // Make sure that we're creating the project in the right spot
    mkDir = location ? (location === '.' ? '' : location) : p.cwd();
    mkDirFiles = mkDir ? `${mkDir}/` : '';
    mkSub = `${mkDirFiles}src`.replace(/\/{2}/g, '/');

    try {

        // We cannot create a dir if the argument is empty
        if (mkDir) {
            fs.mkdirSync(mkDir);
        }
        fs.mkdirSync(mkSub);

        // Create provider folders
        [
            'constants',
            'configs',
            'services',
            'controllers',
            'directives'
        ].forEach(function(v) {
            fs.mkdirSync(`${mkSub}/${v}`);
        });

        // Create static folders
        [
            'static',
            'templates'
        ].forEach(function(v) {
            fs.mkdirSync(`${mkDirFiles}${v}`);
        });
    } catch(e) {
        throw new $$ProjectCreationError(e);
    } finally {

        // Read our AngieFile template and reproduce in the target directory
        let template = fs.readFileSync(
            `${__dirname}/../../templates/AngieFile.template.json`,
            'utf8'
        );
        template = util.format(template, name, name);
        fs.writeFileSync(
            `${mkDirFiles}AngieFile.json`,
            template,
            'utf8'
        );
    }

    $LogProvider.info('Project successfully created');
    p.exit(0);
}

// TODO add test folder, src folder inside