'use strict'; 'use strong';

const chalk =           require('chalk'),
      exec =            require('child_process').exec;

const p = process,
      bold = chalk.bold,
      LOG_LEVELS = {
          debug: 'debug',
          info: true,
          error: true
      };

let ENABLE_DEBUG = true;

class $LogProvider {
    constructor() {
        // TODO configure logfile here from AngieFile
    }
    log() {
        p.stdout.write(null, arguments);
    }
    bold() {
        return p.stdout.write(bold.apply(null, arguments));
    }
    info() {
        let args = __carriage__.apply(null, arguments);
        args.unshift('ANGIE: [Info]');
        args.push('\n');
        p.stdout.write(chalk.green(bold.apply(null, args)));
    }
    debug() {
        if (ENABLE_DEBUG === LOG_LEVELS.debug) {
            this.info.apply(this, arguments);
        }
    }
    warn() {
        let args = __carriage__.apply(null, arguments);
        args.unshift('ANGIE: [Warning]');
        args.push('\n');
        p.stdout.write(chalk.yellow(bold.apply(null, args)));
    }
    error() {
        let args = __carriage__.apply(null, arguments);
        if (args && args[0].stack) {
            args[0] = args[0].stack;
        }
        args.unshift('ANGIE: [Error]');
        args.push('\n');
        p.stdout.write(chalk.red(bold.apply(null, args)));
    }
    shell() {
        return chalk.cyan(bold('angie > '));
    }
    help() {
        let me = this;
        exec('clear', function() {
            me.log('\n');
            me.bold('Angie');
            me.log('An AngularJS inspired NodeJS MVC');
            me.log('\n');
            me.bold('Version:');
            me.log(global.__VERSION__);
            me.log('\n');
            me.bold('Commands:');
            me.log(
                'server [port -- optional]       ' +
                chalk.gray(
                    'Start the Angie Webserver (shortcut with s). Default port ' +
                    'is 3000.'
                )
            );
            me.log(
                'cluster [port -- optional]      ' +
                chalk.gray('Start the Angie Webserver as a Cluster.')
            );
            me.log(
                'createProject [name]            ' +
                chalk.gray(
                    'Create a new Angie project with the specified name in the ' +
                    'current directory.'
                )
            );
            me.log(
                'syncdb [database]               ' +
                chalk.gray(
                    'Sync the current specified databases in the AngieFile. ' +
                    'Defaults to the default created database'
                )
            );
            me.log(
                'migrations                      ' +
                chalk.gray(
                    'Checks to see if the database and the specified ' +
                    'models are out of sync. Generates NO files.'
                )
            );
            me.log(
                'test                            ' +
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

function __carriage__() {
    let args = Array.prototype.slice.call(arguments);
    return args.map((v) => v.replace ? v.replace('\r\n', ' ') : v);
}

const $log = new $LogProvider();
export default $log;
export {$LogProvider};

// TODO this should handle terminal logging and log file output
