/**
 * @module Server.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

// TODO you can remove this from package if it doesn't work
//import watch from                   'node-watch';

var _fbWatchman = require('fb-watchman');

var _chalk = require('chalk');

var _angieLog = require('angie-log');

var _angieLog2 = _interopRequireDefault(_angieLog);

// Angie Modules

var _Config = require('./Config');

var _Angie = require('./Angie');

var _Angie2 = _interopRequireDefault(_Angie);

var _factories$CacheFactory = require('./factories/$CacheFactory');

var _factories$CacheFactory2 = _interopRequireDefault(_factories$CacheFactory);

var _factories$TemplateCache = require('./factories/$TemplateCache');

var _servicesBaseRequest = require('./services/BaseRequest');

var _util$MimeTypeProvider = require('./util/$MimeTypeProvider');

var _util$MimeTypeProvider2 = _interopRequireDefault(_util$MimeTypeProvider);

var CWD = process.cwd(),
    CLIENT = new _fbWatchman.Client(),
    WATCH_DIRS = [CWD, __dirname].concat(_Angie2['default']._$dependencies__),
    SUB = {
    expression: ['allof', ['match', '*.js']],
    fields: []
};
var webserver = undefined;
// let firstrun = true;

// TODO watchman implementation, change these names
function watch(args) {
    var port = $$port(args);
    // TODO you have to do this for each of the dirs
    return CLIENT.capabilityCheck({}, function (e, resp) {
        if (e) {
            throw new Error(e);
        }
        console.log('DO I GET HERE', resp);
        CLIENT.command(['watch-project', CWD], function (e, resp) {
            if (e) {
                throw new Error(e);
            } else if ('warning' in resp) {
                _angieLog2['default'].warn(resp.warning);
            } else {

                _angieLog2['default'].info('Watch initiated on ' + (0, _chalk.cyan)(resp.watch));
                CLIENT.command(['subscribe', resp.watch, 'mysubscription', SUB], function (error, resp) {
                    if (error) {}
                    //console.error('failed to subscribe: ', error);

                    //console.log('subscription ' + resp.subscribe + ' established');
                    CLIENT.on('subscription', function (resp) {
                        // for (var i in resp.files) {
                        //var f = resp.files[i];
                        //if (resp.subscription == 'mysubscription') {
                        //$LogProvider.warn(`Restarting ${cyan('angie')} web server`);
                        //server([port]);
                        //}
                        // }
                        server([port]);
                        //console.log('restarting service');
                    });
                });
            }
        });
    });
}

function server(args) {
    var port = $$port(args);

    // Stop any existing webserver
    if (webserver) {
        webserver.close();
    }

    _Angie2['default'].$$load().then(function () {

        // Start a webserver
        webserver = (port === 443 ? _https2['default'] : _http2['default']).createServer(function (request, response) {
            var path = _url2['default'].parse(request.url).pathname;
            var angieResponse = new _servicesBaseRequest.BaseRequest(path, request, response),
                asset = undefined;

            // A file cannot be in the static path if it doesn't have an extension, shortcut
            // TODO you may want to move the asset loading block out of here
            if (path.indexOf('.') > -1) {
                var assetCache = new _factories$CacheFactory2['default']('staticAssets');

                if (assetCache.get(path)) {
                    asset = assetCache.get(path);
                } else {
                    asset = (0, _factories$TemplateCache.$$templateLoader)(path, 'static');
                }

                // We have an asset and must render a response
                if (asset) {

                    // Set the content type
                    angieResponse.responseHeaders['Content-Type'] = _util$MimeTypeProvider2['default'].fromPath(path);

                    // We do not want to cache responses
                    if (_Config.config.hasOwnProperty('cacheStaticAssets') && !_Config.config.cacheStaticAssets) {
                        angieResponse.responseHeaders = _util2['default']._extend(angieResponse.responseHeaders, {
                            Expires: -1,
                            Pragma: _Angie2['default'].constants.PRAGMA_HEADER,
                            'Cache-Control': _Angie2['default'].constants.NO_CACHE_HEADER
                        });
                    }

                    response.writeHead(200, _Angie2['default'].constants.RESPONSE_HEADER_MESSAGES['200'], angieResponse.responseHeaders);

                    // Check if you have an image type asset
                    _angieLog2['default'].info(path, response._header);
                    response.write(asset);
                }

                // End the response
                response.end();
                return;
            }

            // else {

            angieResponse.$$route().then(function () {
                var code = response.statusCode;
                if (!code) {
                    var error = (0, _factories$TemplateCache.$$templateLoader)('500.html');

                    // TODO extrapolate this to responses
                    response.writeHead(500, _Angie2['default'].constants.RESPONSE_HEADER_MESSAGES['500'], angieResponse.responseHeaders);
                    response.write(error);
                    _angieLog2['default'].error(path, response._header);
                } else if (code < 400) {
                    _angieLog2['default'].info(path, response._header);
                } else if (code < 500) {
                    _angieLog2['default'].warn(path, response._header);
                } else {
                    _angieLog2['default'].error(path, response._header);
                }
                return true;
            }).then(function () {

                // End the response
                response.end();

                // TODO this seems to cause ERR_INCOMPLETE_CHUNKED_ENCODING
                // request.connection.end();
                // request.connection.destroy();
            });

            // }
        }).listen(port);

        // Info
        _angieLog2['default'].info('Serving on port ' + port);
    });
}

function $$port(args) {
    return (/\--?usessl/i.test(args) ? 443 : !isNaN(+args[1]) ? +args[1] : 3000
    );
}

exports.watch = watch;
exports.server = server;