/**
 * @module $ExceptionsProvider.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _angieLog = require('angie-log');

var _angieLog2 = _interopRequireDefault(_angieLog);

var _chalk = require('chalk');

var $$InvalidConfigError = (function (_Error) {
    _inherits($$InvalidConfigError, _Error);

    function $$InvalidConfigError() {
        _classCallCheck(this, $$InvalidConfigError);

        _angieLog2['default'].error('Invalid application configuration. Check your ' + (0, _chalk.blue)('Angiefile.json'));
        _get(Object.getPrototypeOf($$InvalidConfigError.prototype), 'constructor', this).call(this);
    }

    return $$InvalidConfigError;
})(Error);

var $$InvalidComponentConfigError = (function (_SyntaxError) {
    _inherits($$InvalidComponentConfigError, _SyntaxError);

    function $$InvalidComponentConfigError(type, name) {
        if (type === undefined) type = 'directive';

        _classCallCheck(this, $$InvalidComponentConfigError);

        _angieLog2['default'].error('Invalid configuration for ' + type + ' ' + (0, _chalk.cyan)(name));
        _get(Object.getPrototypeOf($$InvalidComponentConfigError.prototype), 'constructor', this).call(this);
    }

    return $$InvalidComponentConfigError;
})(SyntaxError);

var $$InvalidServiceConfigError = (function (_$$InvalidComponentConfigError) {
    _inherits($$InvalidServiceConfigError, _$$InvalidComponentConfigError);

    function $$InvalidServiceConfigError(name) {
        _classCallCheck(this, $$InvalidServiceConfigError);

        _get(Object.getPrototypeOf($$InvalidServiceConfigError.prototype), 'constructor', this).call(this, 'service', name);
    }

    return $$InvalidServiceConfigError;
})($$InvalidComponentConfigError);

var $$InvalidFactoryConfigError = (function (_$$InvalidComponentConfigError2) {
    _inherits($$InvalidFactoryConfigError, _$$InvalidComponentConfigError2);

    function $$InvalidFactoryConfigError(name) {
        _classCallCheck(this, $$InvalidFactoryConfigError);

        _get(Object.getPrototypeOf($$InvalidFactoryConfigError.prototype), 'constructor', this).call(this, 'factory', name);
    }

    return $$InvalidFactoryConfigError;
})($$InvalidComponentConfigError);

var $$InvalidDirectiveConfigError = (function (_$$InvalidComponentConfigError3) {
    _inherits($$InvalidDirectiveConfigError, _$$InvalidComponentConfigError3);

    function $$InvalidDirectiveConfigError(name) {
        _classCallCheck(this, $$InvalidDirectiveConfigError);

        _get(Object.getPrototypeOf($$InvalidDirectiveConfigError.prototype), 'constructor', this).call(this, 'directive', name);
    }

    return $$InvalidDirectiveConfigError;
})($$InvalidComponentConfigError);

exports.$$InvalidConfigError = $$InvalidConfigError;
exports.$$InvalidServiceConfigError = $$InvalidServiceConfigError;
exports.$$InvalidFactoryConfigError = $$InvalidFactoryConfigError;
exports.$$InvalidDirectiveConfigError = $$InvalidDirectiveConfigError;