/**
 * @module util.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

/**
 * @desc Util is a slient utility class which is not available via any provider
 * on the app object. The only way to access the methods on this class is to
 * import the module.
 * @extends util
 * @access private
 * @since 0.2.3
 */

var $Util = (function () {
    function $Util() {
        _classCallCheck(this, $Util);
    }

    _createClass($Util, null, [{
        key: 'noop',

        /**
         * @desc $Util empty function call helper
         * @since 0.2.3
         * @returns {undefined} undefined
         * @example $Util.noop(); // = undefined
         */
        value: function noop() {}
    }]);

    return $Util;
})();

$Util = _util2['default']._extend($Util, _util2['default']);

/**
 * @desc Util is a silent utility class which is not available via any provider
 * on the app object. The only way to access the methods on this class is to
 * import the module. It holds methods quintessential to string manipulation.
 * @since 0.3.1
 */

var $StringUtil = (function () {
    function $StringUtil() {
        _classCallCheck(this, $StringUtil);
    }

    /**
     * @desc $FileUtil is a silent utility class which is not available via any provider
     * on the app object. The only way to access the methods on this class is to
     * import the module. It holds methods quintessential to file management.
     * @since 0.3.1
     */

    _createClass($StringUtil, null, [{
        key: 'removeLeadingSlashes',

        /**
         * @desc Util helper to replace leading slashes
         * @since 0.2.3
         * @param {string} str [param=''] String to process
         * @returns {string} The str param with stripped leading slashes
         * @example 'test' === $StringUtil.removeTrailingLeadingSlashes('/test'); // true
         */
        value: function removeLeadingSlashes(str) {
            return str.charAt(0) === '/' ? str.slice(1, str.length) : str;
        }

        /**
         * @desc Util helper to replace trailing slashes
         * @since 0.2.3
         * @param {string} str [param=''] String to process
         * @returns {string} The str param with stripped trailing slashes
         * @example 'test' === $StringUtil.removeTrailingLeadingSlashes('test/'); // true
         */
    }, {
        key: 'removeTrailingSlashes',
        value: function removeTrailingSlashes(str) {
            return str[str.length - 1] === '/' ? str.slice(0, str.length - 1) : str;
        }

        /**
         * @desc Util helper to replace leading and trailing slashes
         * @since 0.2.3
         * @param {string} str [param=''] String to process
         * @returns {string} The str param with stripped trailing and leading slashes
         * @example 'test' === $StringUtil.removeTrailingLeadingSlashes('/test/'); // true
         */
    }, {
        key: 'removeTrailingLeadingSlashes',
        value: function removeTrailingLeadingSlashes() {
            var str = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

            return $StringUtil.removeTrailingSlashes($StringUtil.removeLeadingSlashes(str));
        }

        /**
         * @desc Util helper to replace dash/slash separation with camelCase
         * @since 0.2.4
         * @param {string} str String to process
         * @returns {string} The str param converted to camelCase
         * @example $StringUtil.toCamel('test-test'); // = 'testTest'
         */
    }, {
        key: 'toCamel',
        value: function toCamel(str) {
            return str.toLowerCase().replace(/[-_][a-z]/g, function (m) {
                return m.toUpperCase().replace(/[-_]/g, '');
            });
        }

        /**
         * @desc Util helper to replace camelCase with underscore_separation
         * @since 0.2.4
         * @param {string} str String to process
         * @returns {string} The str param converted to underscore_separation
         * @example $StringUtil.toCamel('testTest'); // = 'test_test'
         */
    }, {
        key: 'toUnderscore',
        value: function toUnderscore(str) {
            return this.toFormat(str, '_');
        }

        /**
         * @desc Util helper to replace camelCase with dash-separation
         * @since 0.2.4
         * @param {string} str String to process
         * @returns {string} The str param converted to dash-separation
         * @example $StringUtil.toDash('testTest'); // = 'test-test'
         */
    }, {
        key: 'toDash',
        value: function toDash(str) {
            return this.toFormat(str, '-');
        }

        /**
         * @desc Util helper to perform `toDash` or `toUnderscore` style string
         * serilaization
         * @since 0.2.4
         * @param {string} str String to process
         * @param {string} del Character with which to replace camelCase capitals
         * @returns {string} The str param converted to `del` separation
         * @example $StringUtil.toFormat('testTest', '-'); // = 'test-test'
         * @example $StringUtil.toFormat('testTest', '_'); // = 'test_test'
         */
    }, {
        key: 'toFormat',
        value: function toFormat(str, del) {
            return str.replace(/([A-Z]+)/g, del + '$1').toLowerCase();
        }
    }]);

    return $StringUtil;
})();

var $FileUtil = (function () {
    function $FileUtil() {
        _classCallCheck(this, $FileUtil);
    }

    _createClass($FileUtil, null, [{
        key: 'find',

        /**
         * @desc Util helper to help find files in the specified root
         * @since 0.2.4
         * @param {string} root The root directory in which to find files
         * @param {string} target The desired file name
         * @returns {string} The content of the file
         * @example $FileUtil.find(process.cwd(), 'test');
         */
        value: function find(root, target) {

            // Handle slashes
            target = $StringUtil.removeTrailingLeadingSlashes(target);

            // Pull this out because it is used several times
            var fileDirectoryExists = function fileDirectoryExists(n, t) {
                try {
                    return _fs2['default'].lstatSync(n)['is' + t]();
                } catch (e) {
                    return false;
                }
            };

            var template = undefined;
            if (target.indexOf('/') > -1) {

                // We can just search the root for the file
                template = root + '/' + target;
            } else {
                (function () {

                    // If file has no slash, search in all directories
                    var fn = function deepFindFile(root, target) {
                        var files = _fs2['default'].readdirSync(root);
                        for (var i = 0; i < files.length; ++i) {
                            var file = files[i],
                                isDir = fileDirectoryExists(file, 'Directory');
                            if (isDir) {

                                // We have a directory and we need to recurse through it
                                fn(root + '/' + file, target);
                            } else if (file.indexOf(target) > -1) {
                                template = root + '/' + target;
                            }
                            if (template) {
                                break;
                            }
                        }
                    };

                    // Recursively call for all roots
                    fn(root, target);
                })();
            }

            // Check to see that the 'template' we found is an actual file
            if (template && fileDirectoryExists(template, 'File')) {
                return template;
            }
            return undefined;
        }
    }]);

    return $FileUtil;
})();

exports['default'] = $Util;
exports.$StringUtil = $StringUtil;
exports.$FileUtil = $FileUtil;