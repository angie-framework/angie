/**
 * @module decorators.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
function Base(name) {
    return function (obj) {
        global.app[name](obj.name, obj);
    };
}

var Controller = Base('Controller'),
    directive = Base('directive');

exports.Controller = Controller;
exports.directive = directive;