/**
 * @module $TemplateCache.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _angieInjector = require('angie-injector');

var _angieInjector2 = _interopRequireDefault(_angieInjector);

// Angie Modules

var _Config = require('../Config');

var _$CacheFactory2 = require('./$CacheFactory');

var _$CacheFactory3 = _interopRequireDefault(_$CacheFactory2);

var _utilUtil = require('../util/Util');

var p = process,
    ANGIE_TEMPLATE_DIRS = [__dirname + '/../templates/html', __dirname + '/../../test/src/templates'],
    ANGIE_STATIC_DIRS = [];

var $TemplateCache = (function (_$CacheFactory) {
    _inherits($TemplateCache, _$CacheFactory);

    function $TemplateCache() {
        _classCallCheck(this, $TemplateCache);

        _get(Object.getPrototypeOf($TemplateCache.prototype), 'constructor', this).call(this, 'templateCache');
    }

    _createClass($TemplateCache, [{
        key: 'get',
        value: function get(url) {
            var template = _get(Object.getPrototypeOf($TemplateCache.prototype), 'get', this).call(this, url);
            if (!template) {
                template = $$templateLoader(url);
            }
            if (template && _Config.config.cacheStaticAssets) {
                this.put(url, template);
            }
            return template;
        }
    }]);

    return $TemplateCache;
})(_$CacheFactory3['default']);

function $$templateLoader(url, type, encoding) {
    if (type === undefined) type = 'template';

    // Clone them template dirs
    var templateDirs = _Config.config[type + 'Dirs'].slice() || [],
        template = undefined;

    // Add the default Angie template dirs to the existing config template dirs
    templateDirs = templateDirs.concat(type === 'template' ? ANGIE_TEMPLATE_DIRS : type === 'static' ? ANGIE_STATIC_DIRS : []);

    templateDirs = templateDirs.map(function (dir) {
        if ((type === 'template' && ANGIE_TEMPLATE_DIRS.indexOf(dir) === -1 || type === 'static' && ANGIE_STATIC_DIRS.indexOf(dir) === -1) && dir.indexOf(p.cwd()) === -1) {
            dir = _utilUtil.$StringUtil.removeLeadingSlashes(dir);
            dir = p.cwd() + '/' + dir;
        }
        dir = _utilUtil.$StringUtil.removeTrailingSlashes(dir);
        return dir;
    });

    // Deliberately use a for loop so that we can break out of it
    for (var i = templateDirs.length - 1; i >= 0; --i) {
        var dir = templateDirs[i],
            path = _utilUtil.$FileUtil.find(dir, url);

        if (typeof path === 'string') {
            template = _fs2['default'].readFileSync(path, encoding || undefined);
        }

        if (template) {
            break;
        }
    }

    if (!template) {
        return false;
    } else if (type === 'static' && _Config.config.hasOwnProperty('cacheStaticAssets') && _Config.config.cacheStaticAssets === true) {
        // TODO you may want to put this in the asset loading block
        new _$CacheFactory3['default']('staticAssets').put(url, template);
    }
    return template;
}

/**
 * @desc $resourceLoader is a factory that will attach a JavaScript resource
 * to any respose. It will attach it inside of the body if the file is requested
 * to be attached on an HTML response.
 * @since 0.3.2
 * @todo Make this work with .css, .less, .scss, .haml
 * @todo Auto load Angular, jQuery, Underscore, etc. from their names alone
 * via Bower installs. Must create bower.json & bump bower version.
 * @param {string|Array} [param=10] filename Valid JS filename in Angie static
 * directories
 * @param {string} [param='src'] loadStyle How is this resource attached to the
 * document. Options:
 *     'src':       Include a script tag with the name of the resource
 *     'inline':    Include the resource content inline
 * @returns {boolean} Whether this function successfully finished (not an
 * indication that the resource was actually attached)
 * @access public
 * @example $resourceLoader('test.js');
 */
function $resourceLoader() {
    var files = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
    var loadStyle = arguments.length <= 1 || arguments[1] === undefined ? 'src' : arguments[1];

    console.log('IN RESOURCE LOADER', files);

    var _$Injector$get = _angieInjector2['default'].get('$request', '$response');

    var _$Injector$get2 = _slicedToArray(_$Injector$get, 2);

    var $request = _$Injector$get2[0];
    var $response = _$Injector$get2[1];

    console.log('RESPONSE', $response);
    if (!$response || typeof $response !== 'object') {
        return false;
    } else if (!$response.$responseContent) {

        // Just in case the response property was not already defined
        $response.$responseContent = '';
    }

    if (typeof files === 'string') {
        files = [files];
    }

    files.forEach(function (resource) {

        // Return if not a js file
        if (resource.split('.').pop() !== 'js') {
            return;
        }

        console.log('IN RESOURCE LOADER', resource);

        // TODO put this into a template?
        var asset = '<script type="text/javascript"';
        if (loadStyle === 'src') {
            asset += ' src="' + [_utilUtil.$StringUtil.removeTrailingSlashes($request.path).replace(/([A-Za-z]+)/g, '..'), resource].join('/') + '">';
        } else {
            var assetCache = new _$CacheFactory3['default']('staticAssets'),
                assetPath = resource.split('/').pop(),
                staticAsset = undefined;

            asset += '>';
            if (assetCache.get(assetPath)) {
                staticAsset = assetCache.get(assetPath);
            } else {
                staticAsset = $$templateLoader(assetPath, 'static', 'utf8');
            }

            if (staticAsset.length) {
                asset += '' + staticAsset;
            }
        }

        asset += '</script>';

        console.log('ASSET', asset);

        var BODY = '</body>',
            STR = $response.$responseContent;
        if (STR.indexOf(BODY) > -1) {
            var body = STR.lastIndexOf(BODY);

            console.log('IN BODY');

            $response.$responseContent = '' + STR.substr(0, body) + asset + STR.substr(body);
        } else {
            $response.$responseContent = $response.$responseContent + asset;
        }
        console.log('content', $response.$responseContent);
    });
    return true;
}

var $templateCache = new $TemplateCache();
exports.$templateCache = $templateCache;
exports.$$templateLoader = $$templateLoader;
exports.$resourceLoader = $resourceLoader;