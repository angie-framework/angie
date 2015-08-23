/**
 * @module Config.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

// Angie Modules

var _utilUtil = require('./util/Util');

var _util$ExceptionsProvider = require('./util/$ExceptionsProvider');

var config = {};

var Config = function Config() {
    var _arguments = arguments;

    _classCallCheck(this, Config);

    if (Object.keys(config).length === 0) {
        return new Promise(function (resolve, reject) {

            // Use the file finder to check against filetype
            var fileNames = ['angiefile', 'angieFile', 'Angiefile', 'AngieFile'],
                acceptedFileNames = [],
                file = undefined;

            fileNames.forEach(function (name) {
                acceptedFileNames.push(name + '.json');
                acceptedFileNames.push(name + '.js');
                acceptedFileNames.push(name + '.es6');
            });

            acceptedFileNames.forEach(function (name) {
                var tmpFile = _utilUtil.$FileUtil.find(process.cwd(), name);
                if (tmpFile) {
                    file = tmpFile;
                }
            });

            try {
                resolve(_fs2['default'].readFileSync(file, 'utf8'));
            } catch (e) {
                reject(e);
            }
        }).then(function (stdout) {
            exports.config = config = JSON.parse(stdout);
            if (global.app) {
                global.app.$$config = Object.freeze(config);
            }
        })['catch'](function () {
            throw new _util$ExceptionsProvider.$$InvalidConfigError();
        });
    } else {
        return new Promise(function () {
            return _arguments[0]();
        });
    }
};

exports['default'] = Config;
exports.config = config;