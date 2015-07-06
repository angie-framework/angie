'use strict'; 'use strong';

// Global Modules
import 'es6-module-loader';
import {transform} from             'babel';

// System Modules
import {exec} from                  'child_process';

// Angie Modules
import Config from                  './Config';
import $$createProject from         './util/scaffold/project';
import server from                  './Server';
import shell from                   './util/shell';
import $log from                    './util/$LogProvider';

// Tranform BabelJS options
transform('code', { stage: 0 });

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
        $log.help();
        break;
    case 'help':
        $log.help();
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
    default: $log.help();
}

function runTests() {

    // TODO is there any way to carry the stream output from gulp instead
    // of capturing stdout?
    exec(`cd ${__dirname} && gulp`, function(e, std, err) {
        $log.log(std);
        if (err) {
            $log.error(err);
        }
        if (e) {
            throw new Error(e);
        }
    });
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

// TODO make all commands here
// TODO cluster
