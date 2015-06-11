'use strict'; 'use strong';

import Config from './Config';
import $log from './util/$LogProvider';
import createProject from './util/scaffold/project';
import AngieDatabaseRouter from './models/AngieDatabaseRouter';
import server from './Server';
import shell from './util/shell';

const exec =        require('child_process').exec;

const p = process;

// Remove trivial arguments
let args = [];
p.argv.forEach(function(v) {
    if (v.match(/^(?:(?!(node|iojs)).)*$/)) {
        args.push(v);
    }
});

// Reassign config calls
let __server__ = requiresConfig.bind(null, server),
    __db__ = requiresConfig.bind(null, AngieDatabaseRouter);

if (args.length === 1) {
    args.push('');
}

// Route the CLI request to a specific command
switch (args[1].toLowerCase()) {
    case '':
        $log.help();
        break;
    case 'help':
        $log.help();
        break;
    case 'server':
        __server__();
        break;
    case 's':
        __server__();
        break;
    case 'cluster':
        break;
    case 'createproject':
        createProject({ name: args[2] });
        break;
    case 'syncdb':
        __db__().then((db) => db.sync());
        break;
    case 'migrate':
        __db__().then((db) => db.migrate());
        break;
    case 'test':
        runTests();
        break;
    case 'shell':
        shell();
        break;
    default:
        $log.help();
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
// TODO make config a service
function requiresConfig(fn) {

    // Fetch configs
    return new Config().then(function() {
        return fn(args);
    }, function() {
        p.exit(1);
    });
}

// TODO make all commands here
    // TODO create database
    // TODO migrate database
    // TODO cluster
