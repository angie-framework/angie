'use strict'

import Config from '../Config';

const Console =     require('console').Console,
      chalk =       require('chalk');

const bold = chalk.bold;

class AngieConsole extends Console {
    constructor {
        // TODO configure logfile here from AngieFile
    }
    info() {
        let args = Array.prototype.slice.call(arguments);
        args.forEach(function() {

        });
        super.info(chalk.green(bold.apply(null, args)));
    }
    error() {
        super.error(chalk.red(bold.apply(null, arguments)));
    }
}

export default AngieConsole

// TODO replace all console log with Console
// TODO this should handle terminal logging and log file output
