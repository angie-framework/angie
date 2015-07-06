'use strict'; 'use strong';

// System Modules
import chalk from 'chalk';
import {exec} from 'child_process';

const p = process,
      bold = chalk.bold,
      LOG_LEVELS = {
          debug: 'debug',
          info: true,
          error: true
      };

let ENABLE_DEBUG = true;

class $LogProvider {
    log() {
        console.log.apply(null, arguments);
    }
    bold() {
        return console.log(bold.apply(null, arguments));
    }
    info() {
        let args = _carriage.apply(null, arguments);
        args.unshift('ANGIE: [Info]');
        args.push('\r');
        console.log(chalk.green(bold.apply(null, args)));
    }
    debug() {
        if (ENABLE_DEBUG === LOG_LEVELS.debug) {
            this.info.apply(this, arguments);
        }
    }
    warn() {
        let args = _carriage.apply(null, arguments);
        args.unshift('ANGIE: [Warning]');
        args.push('\r');
        console.warn(chalk.yellow(bold.apply(null, args)));
    }
    error() {
        let args = _carriage.apply(null, arguments);
        if (args && args[0].stack) {
            args[0] = args[0].stack;
        }
        args.unshift('ANGIE: [Error]');
        args.push('\r');
        console.error(chalk.red(bold.apply(null, args)));
    }
    shell() {
        return chalk.cyan(bold('angie > '));
    }
    help() {
        let me = this;
        exec('clear', function() {
            me.bold('Angie');
            me.log('An AngularJS inspired NodeJS MVC');
            me.log('\r');
            me.bold('Version:');
            me.log(global._ANGIE_VERSION);
            me.log('\r');
            me.bold('Commands:');
            me.log(
                'server [ port -- optional ]                        ' +
                chalk.gray(
                    'Start the Angie Webserver (shortcut with s). Default port ' +
                    'is 3000.'
                )
            );
            me.log(
                'cluster [ port -- optional ]                       ' +
                chalk.gray('Start the Angie Webserver as a Cluster.')
            );
            me.log(
                'createProject [ name ] [ location -- optional ]    ' +
                chalk.gray(
                    'Create a new Angie project with the specified name in the ' +
                    'current directory.'
                )
            );
            me.log(
                'syncdb [ database ]                                ' +
                chalk.gray(
                    'Sync the current specified databases in the AngieFile. ' +
                    'Defaults to the default created database'
                )
            );
            me.log(
                'migrations                                         ' +
                chalk.gray(
                    'Checks to see if the database and the specified ' +
                    'models are out of sync. Generates NO files.'
                )
            );
            me.log(
                'test                                               ' +
                chalk.gray(
                    'Runs the Angie test suite and prints the results in the ' +
                    'console'
                )
            );
            me.log('\n');
            p.exit(0);
        });
    }
    static setDebugLevel(b) {
        ENABLE_DEBUG = b;
    }
}

function _carriage() {
    let args = Array.prototype.slice.call(arguments);
    return args.map((v) => v.replace ? v.replace('\r\n', ' ') : v);
}

const $log = new $LogProvider();
export default $log;
export {$LogProvider};
