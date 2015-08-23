/**
 * @module shell.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _repl = require('repl');

var _repl2 = _interopRequireDefault(_repl);

var _angieLog = require('angie-log');

var _angieLog2 = _interopRequireDefault(_angieLog);

var p = process;

function shell() {
    global.app.$$load().then(function () {
        p.stdin.setEncoding('utf8');
        _repl2['default'].start({
            prompt: _angieLog2['default'].$shell(),
            input: p.stdin,
            output: p.stdout
        });
    });
}

exports['default'] = shell;
module.exports = exports['default'];