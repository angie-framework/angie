/**
 * @module $MimeTypeProvider.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var MIME_TYPE = {
  html: 'text/html',
  css: 'text/css',
  jpg: 'image/jpeg',
  js: 'application/javascript',
  png: 'image/png',
  svg: 'image/svg+xml'
},
    DEFAULT_TYPE = 'text/plain';

/**
 * @desc $MimeTypeProvider is predominately used internally to specify a properties
 * mime type on response objects. It can also be used in special cases for
 * routing views.
 * @since 0.2.6
 * @access public
 * @example $MimeTypeProvider._('test.json'); // = 'application/json'
 */

var $MimeTypeProvider = (function () {
  function $MimeTypeProvider() {
    _classCallCheck(this, $MimeTypeProvider);
  }

  _createClass($MimeTypeProvider, null, [{
    key: '$$',

    /**
     * @desc Find a mime type based on ext
     * @since 0.2.6
     * @access private
     * @param {string} ext [param='html'] Content-Type to check against
     * @returns {string} An approximated Content-Type
     * @example $MimeTypeProvider._('json'); // = 'application/json'
     */
    value: function $$() {
      var ext = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

      return MIME_TYPE[ext] || DEFAULT_TYPE;
    }

    /**
     * @desc Find a mime type based on a pathname
     * @since 0.2.6
     * @access public
     * @param {string} path File path to check against
     * @returns {string} An approximated Content-Type
     * @example $MimeTypeProvider._fromPath('test.json'); // = 'application/json'
     */
  }, {
    key: 'fromPath',
    value: function fromPath(path) {
      return this.$$(path.indexOf('.') > -1 ? path.split('.').pop() : undefined);
    }
  }]);

  return $MimeTypeProvider;
})();

exports['default'] = $MimeTypeProvider;
module.exports = exports['default'];