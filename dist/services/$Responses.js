/**
 * @module $Responses.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Angie = require('../Angie');

var _Angie2 = _interopRequireDefault(_Angie);

var $Response = function $Response(response) {
    _classCallCheck(this, $Response);

    this.response = response;
    _Angie2['default'].service('$response', this.response);
}

// TODO use these classes to format responses instead of BaseRequest
// class $APIResponse extends $Response {
//
// }

// class $TemplateResponse extends $Response {
//
// }

;

exports.$Response = $Response;