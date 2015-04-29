'use strict';

import Config from './Config';

// TODO merge into one module
import createProject from './util/scaffold/project';
import createInstance from './util/scaffold/instance';
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

// Fetch configs
new Config().then(function() {
    switch (args[1]) {
        case 'cluster':
        case 'server':
            server();
            break;
        case 'createProject':
            createProject(args[2]);
            break;
        case 'createInstance':
            createInstance(args[2]);
            break;
        case 'syncdb':
            new DB();
            break;
        case 'migrations':
        default:
            server();
    }
}, function() {
    p.exit(1);
});


// TODO make all commands here
    // TODO scaffold application
    // TODO make instance (app)
    // TODO create database
    // TODO migrate database
    // TODO cluster
    // TODO shell
