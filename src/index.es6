'use strict';

import Config from './Config';
import $log from './util/$LogProvider';
import createProject from './util/scaffold/project';
import {default as DB} from './Database';
import server from './Server';

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
    __db__ = requiresConfig.bind(null, function() {
        return new DB();
    });

if (args.length === 1) {
    args.push('');
}

// Route the CLI request to a specific command
switch (args[1]) {
    case '':
        $log.help();
        break;
    case 'help':
        $log.help();
        break;
    case 'server':
        __server__({ port: args[2] });
        break;
    case 's':
        __server__({ port: args[2] });
        break;
    case 'cluster':
        break;
    case 'createProject':
        createProject({ name: args[2] });
        break;
    case 'syncdb':
        __db__();
        break;
    case 'migrations':
        break;
    case 'test':
        runTests();
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
    // TODO make instance (app)
    // TODO create database
    // TODO migrate database
    // TODO cluster
    // TODO shell
