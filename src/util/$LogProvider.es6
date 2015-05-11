'use strict'

const chalk =           require('chalk'),
      exec =            require('child_process').exec;

const p = process,
      bold = chalk.bold,
      LOG_LEVELS = {
          'debug': true,
          'info': true,
          'error': true
      };

let ENABLE_DEBUG = true;

class $LogProvider {
    constructor() {
        // TODO configure logfile here from AngieFile
    }
    log() {
        console.log.apply(null, arguments);
    }
    bold() {
        return this.log(bold.apply(null, arguments));
    }
    info() {
        let args = __carriage__.apply(null, arguments);
        args.unshift('ANGIE: [Info]');
        console.info(chalk.green(bold.apply(null, args)));
    }
    debug() {
        if (ENABLE_DEBUG === 'debug') {
            this.info.apply(this, arguments);
        }
    }
    warn() {
        let args = __carriage__.apply(null, arguments);
        args.unshift('ANGIE: [Warning]');
        console.log(chalk.yellow(bold.apply(null, args)));
    }
    error() {
        let args = __carriage__.apply(null, arguments);
        if (args[0].stack) {
            args[0] = args[0].stack;
        }
        args.unshift('ANGIE: [Error]');
        console.error(chalk.red(bold.apply(null, args)));
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
                    'is 9000.'
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
                'syncdb                          ' +
                chalk.gray(
                    'Sync the current specified databases in the AngieFile.'
                )
            );
            me.log(
                'migrations                      ' +
                chalk.gray(
                    'Checks to see if the database and the specified ' +
                    'models are out of sync. Generates NO files.'
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

    // TODO change to regexp if you want to replace all
    return args.map((v) => v.replace('\r\n', ' '));
}

const $log = new $LogProvider();
export default $log;

// TODO this should handle terminal logging and log file output
