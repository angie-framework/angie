/**
 * @module $Request.js
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

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

// Angie Modules

var _Angie = require('../Angie');

var _Angie2 = _interopRequireDefault(_Angie);

var $Request = function $Request(request) {
    _classCallCheck(this, $Request);

    this.request = request;
    this.request.query = _url2['default'].parse(request.url, true).query;

    _Angie2['default'].service('$request', this.request);
};

exports['default'] = $Request;
module.exports = exports['default'];