'use strict';

import Config from './Config';
import createProject from './util/scaffold/project';
//import createInstance from './util/scaffold/instance';
import {default as DB} from './Database';
import server from './Server';

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

switch (args[1]) {
    case 'cluster':
    case 'server':
        __server__({ port: args[2] });
        break;
    case 's':
        __server__({ port: args[2] });
        break;
    case 'createProject':
        createProject({ name: args[2] });
        break;
    case 'syncdb':
        __db__();
        break;
    case 'migrations':
    default:
        __server__({ port:args[2] });
}

function requiresConfig(fn, args = {}) {

    // Fetch configs
    return new Config().then(function() {
        return fn(args);
    }, function() {
        p.exit(1);
    })
}


// TODO make all commands here
    // TODO scaffold application
    // TODO make instance (app)
    // TODO create database
    // TODO migrate database
    // TODO cluster
    // TODO shell
