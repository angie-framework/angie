'use strict'; 'use strong';

// Global Modules
import 'es6-module-loader';

// System Modules
import {exec} from                  'child_process';
import {gray} from                  'chalk';
import $LogProvider from            'angie-log';

// Angie Modules
import Config from                  './Config';
import $$createProject from         './util/scaffold/project';
import server from                  './Server';
import shell from                   './util/shell';

// System/Tranform BabelJS options
System.transpiler = 'babel';

const p = process;
let args = [],
    $$server = requiresConfig.bind(null, server),
    $$db = requiresConfig.bind(null, require.bind(null, 'angie-orm')),
    $$shell = requiresConfig.bind(null, shell);

// Remove trivial arguments
p.argv.forEach(function(v) {
    if (!v.match(/(node|iojs|index|angie)/)) {
        args.push(v);
    }
});

// Route the CLI request to a specific command
switch ((args[0] || '').toLowerCase()) {
    case 'help':
        help();
        break;
    case 'server':
        $$server();
        break;
    case 's':
        $$server();
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
        $$db();
        break;
    case 'migrate':
        $$db();
        break;
    case 'test':
        runTests();
        break;
    case 'shell':
        $$shell();
        break;
    default:
        $LogProvider.error('Unrecognized CLI Argument');
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
    console.log('A Component-based NodeJS MVC');
    console.log('\r');
    $LogProvider.bold('Version:');
    console.log(global.ANGIE_VERSION);
    console.log('\r');
    $LogProvider.bold('Commands:');
    console.log(
        'server [ port -- optional ]                        ' +
        gray(
            'Start the Angie Webserver (shortcut with s). Default port ' +
            'is 3000.'
        )
    );
    console.log(
        'cluster [ port -- optional ]                       ' +
        gray('Start the Angie Webserver as a Cluster.')
    );
    console.log(
        'createProject [ name ] [ location -- optional ]    ' +
        gray(
            'Create a new Angie project with the specified name in the ' +
            'current directory.'
        )
    );
    console.log(
        'test                                               ' +
        gray(
            'Runs the Angie test suite and prints the results in the ' +
            'console'
        )
    );
}