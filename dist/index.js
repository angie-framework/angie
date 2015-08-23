/**
 * @module index.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// Global Modules
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

require('es6-module-loader');

// System Modules

var _child_process = require('child_process');

var _chalk = require('chalk');

var _angieLog = require('angie-log');

var _angieLog2 = _interopRequireDefault(_angieLog);

// Angie Modules

var _Config = require('./Config');

var _Config2 = _interopRequireDefault(_Config);

var _utilScaffoldProject = require('./util/scaffold/project');

var _utilScaffoldProject2 = _interopRequireDefault(_utilScaffoldProject);

var _Server = require('./Server');

var _utilShell = require('./util/shell');

var _utilShell2 = _interopRequireDefault(_utilShell);

// System/Tranform BabelJS options
System.transpiler = 'babel';

var p = process,
    $$server = requiresConfig.bind(null, _Server.server),
    $$watch = requiresConfig.bind(null, _Server.watch),
    $$shell = requiresConfig.bind(null, _utilShell2['default']),
    $$db = requiresConfig.bind(null, require.bind(null, 'angie-orm'));
var args = [];

// Remove trivial arguments
p.argv.forEach(function (v) {
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
    case 'watch':
        $$watch();
        break;
    case 's':
        $$server();
        break;
    case 'cluster':
        break;
    case 'createproject':
        (0, _utilScaffoldProject2['default'])({
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
        _angieLog2['default'].error('Unrecognized CLI Argument');
}

// Wrapper function for services which require configs to be loaded
function requiresConfig(fn) {

    // Fetch configs
    return new _Config2['default']().then(function () {
        return typeof fn === 'function' ? fn(args) : args;
    }, function () {
        p.exit(1);
    });
}

function runTests() {

    // TODO is there any way to carry the stream output from gulp instead
    // of capturing stdout?
    (0, _child_process.exec)('cd ' + __dirname + ' && gulp', function (e, std, err) {
        _angieLog2['default'].info(std);
        if (err) {
            _angieLog2['default'].error(err);
        }
        if (e) {
            throw new Error(e);
        }
    });
}

function help() {
    _angieLog2['default'].bold('Angie');
    console.log('A Component-based NodeJS MVC');
    console.log('\r');
    _angieLog2['default'].bold('Version:');
    console.log(global.ANGIE_VERSION);
    console.log('\r');
    _angieLog2['default'].bold('Commands:');
    console.log('server [ port -- optional ]                        ' + (0, _chalk.gray)('Start the Angie Webserver (shortcut with s). Default port ' + 'is 3000.'));
    console.log('cluster [ port -- optional ]                       ' + (0, _chalk.gray)('Start the Angie Webserver as a Cluster.'));
    console.log('createProject [ name ] [ location -- optional ]    ' + (0, _chalk.gray)('Create a new Angie project with the specified name in the ' + 'current directory.'));
    console.log('test                                               ' + (0, _chalk.gray)('Runs the Angie test suite and prints the results in the ' + 'console'));
}