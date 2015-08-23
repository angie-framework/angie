/**
 * @module project.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
// Do not alias this as the commands mirror the global `confirm` and `prompt`
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

exports['default'] = $$createProject;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _promptly = require('promptly');

var _promptly2 = _interopRequireDefault(_promptly);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _angieLog = require('angie-log');

var _angieLog2 = _interopRequireDefault(_angieLog);

// Angie Modules

var _Util = require('../Util');

var p = process,
    breen = function breen(v) {
    return (0, _chalk.bold)((0, _chalk.green)(v));
};

/**
 * @desc $$createProject is the function called when the CLI attempts to create
 * a project from the command line. This scaffolds the main folder in the
 * specified location or no folder and then folders for commonly used providers
 * and the Angie config file (AngieFile.json).
 *
 * The CLI function to create a project will ask the user a series of questions.
 * The result of these questions will be passed to the AngieFile.json.
 *
 * This function will gracefully exit the process if successful and exit with
 * errors if unsuccessful.
 * @since 0.0.1
 * @param {object} args A list of arugments passed from the CLI parser
 * @param {string} args.name The name of the project being created. This must
 * consist of letters, dashes, & underscores
 * @param {string} args.location [param=process.cwd()] The location in which the
 * inner files of the project are created. CWD if no location is specified.
 * @access private
 */

function $$createProject() {
    var args = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    // Parse the passed arguments object
    var name = args.name,
        location = _Util.$StringUtil.removeTrailingLeadingSlashes(args.location);
    var mkDir = undefined,
        mkDirFiles = undefined,
        mkSub = undefined;

    // The process must exit if there is no passed name, or the name passed is
    // in an incorrect format
    if (!name) {
        throw new $$ProjectCreationError('No project name specified');
    } else if (/[0-9$%\^&*\)\(\<\>\\\/\.\,\`\?\+\!\~#@=\}\{\|\]\[\'\"\:\;]+/i.test(name)) {

        // Being super specific about which characters are OK and which are not
        throw new $$ProjectCreationError('Invalid project name: must be all letters, dashes, & underscores');
    }

    // Make sure that we're creating the project in the right spot
    mkDir = location ? location === '.' ? '' : location : p.cwd() + '/' + name;
    mkDirFiles = mkDir ? mkDir + '/' : '';
    mkSub = (mkDirFiles + 'src').replace(/\/{2}/g, '/');

    try {

        // We cannot create a dir if the argument is empty
        if (mkDir) {
            _fs2['default'].mkdirSync(mkDir);
        }
        _fs2['default'].mkdirSync(mkSub);

        // Create provider folders
        ['constants', 'configs', 'services', 'controllers', 'directives'].forEach(function (v) {
            _fs2['default'].mkdirSync(mkSub + '/' + v);
        });

        // Create static folders
        ['test', 'static', 'templates'].forEach(function (v) {
            _fs2['default'].mkdirSync('' + mkDirFiles + v);
        });
    } catch (e) {
        throw new $$ProjectCreationError(e);
    } finally {
        (function () {

            // This is where we create our AngieFile, we can pick certain values with
            // which we can populate our config:

            // cacheStaticAssets
            var staticCache = false,

            // Default JS to be loaded with all HTML files
            defaultAppJavaScriptFilename = undefined;

            // Wrap the prompts in a Promise
            new Promise(function (resolve) {
                _promptly2['default'].confirm(breen('Do you want Angie to cache static assets?') + ' :', resolve);
            }).then(function (v) {
                staticCache = !!v;
                return;
            }).then(function () {

                // Ask what the default JS filename should be
                return new Promise(function (resolve) {
                    return _promptly2['default'].prompt(breen('What would you like to call the "default" ' + 'loaded script file ' + ('(' + (0, _chalk.bold)(_chalk2['default'].white('default is')) + ' ') + (_chalk2['default'].cyan('application.js') + ')?')) + ' :', {
                        'default': 'application.js',
                        validator: function validator(v) {
                            if (v && v.indexOf('.js') === -1) {
                                throw new Error((0, _chalk.bold)(_chalk2['default'].red('Input must be a valid ".js" file.')));
                            }
                            return v.replace(/\/|\\/g, '');
                        }
                    }, function (e, v) {
                        resolve(v);
                    });
                });
            }).then(function (v) {
                defaultAppJavaScriptFilename = v;
            }).then(function () {

                // Read our AngieFile template and reproduce in the target directory
                var template = _fs2['default'].readFileSync(__dirname + '/../../templates/json/AngieFile.template.json', 'utf8');
                template = _util2['default'].format(template, name, name, staticCache, defaultAppJavaScriptFilename);
                _fs2['default'].writeFileSync(mkDirFiles + 'AngieFile.json', template, 'utf8');
                _fs2['default'].writeFileSync(mkDirFiles + 'static/' + defaultAppJavaScriptFilename, '');

                _angieLog2['default'].info('Project successfully created');
                p.exit(0);
            })['catch'](function (e) {
                console.log(e);
            });
        })();
    }
}

var $$ProjectCreationError = (function (_Error) {
    _inherits($$ProjectCreationError, _Error);

    function $$ProjectCreationError(e) {
        _classCallCheck(this, $$ProjectCreationError);

        _angieLog2['default'].error(e);
        _get(Object.getPrototypeOf($$ProjectCreationError.prototype), 'constructor', this).call(this, e);
    }

    return $$ProjectCreationError;
})(Error);

module.exports = exports['default'];