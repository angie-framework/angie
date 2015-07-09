'use strict'; 'use strong';

// Global Modules
import 'es6-module-loader';
import {transform} from             'babel';

// System Modules
import {exec} from                  'child_process';
import chalk from                   'chalk';
import $LogProvider from            'angie-log';

// Angie Modules
import Config from                  './Config';
import $$createProject from         './util/scaffold/project';
import server from                  './Server';
import shell from                   './util/shell';

// System/Tranform BabelJS options
transform('code', { stage: 0 });
System.transpiler = 'babel';

const p = process;
let args = [],
    _server = requiresConfig.bind(null, server),
    _db = requiresConfig.bind(null);

// Remove trivial arguments
p.argv.forEach(function(v) {
    if (!v.match(/(node|iojs|index|angie)/)) {
        args.push(v);
    }
});

// Route the CLI request to a specific command
switch ((args[0] || '').toLowerCase()) {
    case '':
        help();
        break;
    case 'help':
        help();
        break;
    case 'server':
        _server();
        break;
    case 's':
        _server();
        break;
    case 'cluster':
        break;
    case 'createproject':
        $$createProject({
            name: args[1],
            location: args[2]
        });
        break;
    case 'syncdb':
        _db().then(System.import('angie-orm/src/index')).then(
            p.exit.bind(0), p.exit.bind(1)
        );
        break;
    case 'migrate':
        _db().then(System.import('angie-orm/src/index')).then(
            p.exit.bind(0), p.exit.bind(1)
        );
        break;
    case 'test':
        runTests();
        break;
    case 'shell':
        shell();
        break;
    default: help();
}

// Wrapper function for services which require configs to be loaded
function requiresConfig(fn) {

    // Fetch configs
    return new Config().then(function() {
        return typeof fn === 'function' ? fn(args) : args;
    }, function() {
        p.exit(1);
    });
}

function runTests() {

    // TODO is there any way to carry the stream output from gulp instead
    // of capturing stdout?
    exec(`cd ${__dirname} && gulp`, function(e, std, err) {
        $LogProvider.info(std);
        if (err) {
            $LogProvider.error(err);
        }
        if (e) {
            throw new Error(e);
        }
    });
}

function help() {
    $LogProvider.bold('Angie');
    console.log('An AngularJS inspired NodeJS MVC');
    console.log('\r');
    $LogProvider.bold('Version:');
    console.log(global.ANGIE_VERSION);
    console.log('\r');
    $LogProvider.bold('Commands:');
    console.log(
        'server [ port -- optional ]                        ' +
        chalk.gray(
            'Start the Angie Webserver (shortcut with s). Default port ' +
            'is 3000.'
        )
    );
    console.log(
        'cluster [ port -- optional ]                       ' +
        chalk.gray('Start the Angie Webserver as a Cluster.')
    );
    console.log(
        'createProject [ name ] [ location -- optional ]    ' +
        chalk.gray(
            'Create a new Angie project with the specified name in the ' +
            'current directory.'
        )
    );
    console.log(
        'syncdb [ database ]                                ' +
        chalk.gray(
            'Sync the current specified databases in the AngieFile. ' +
            'Defaults to the default created database'
        )
    );
    console.log(
        'migrations [ --destructive -- optional ]           ' +
        chalk.gray(
            'Checks to see if the database and the specified ' +
            'models are out of sync. Generates NO files.'
        )
    );
    console.log(
        'test                                               ' +
        chalk.gray(
            'Runs the Angie test suite and prints the results in the ' +
            'console'
        )
    );
}

// TODO make all commands here
// TODO cluster