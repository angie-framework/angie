/**
 * @module Server.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
import http from                    'http';
import https from                   'https';
import url from                     'url';
import util from                    'util';

// TODO you can remove this from package if it doesn't work
//import watch from                   'node-watch';
import {Client} from                'fb-watchman';
import {cyan} from                  'chalk';
import $LogProvider from            'angie-log';

// Angie Modules
import {config} from                './Config';
import app from                     './Angie';
import $CacheFactory from           './factories/$CacheFactory';
import {$$templateLoader} from      './factories/$TemplateCache';
import {BaseRequest} from           './services/BaseRequest';
import {default as $MimeType} from  './util/$MimeTypeProvider';

const CLIENT = new Client(),
    SUB = {
        expression: [ 'anyof', [ 'match', '*.js' ], [ 'match', '*.es6' ] ],
        fields: []
    };
let webserver;

// TODO watchman implementation, change these names
function watch(args) {
    const PORT = $$port(args),
        WATCH_DIR = /--?devmode/i.test(args) ? __dirname : process.cwd();

    return CLIENT.capabilityCheck({}, function (e, resp) {
        if (e) {
            throw new Error(e);
        }
        CLIENT.command([ `watch-project`, WATCH_DIR ], function (e, resp) {
            if (e) {
                throw new Error(e);
            } else if ('warning' in resp) {
                $LogProvider.warn(resp.warning);
            } else {
                $LogProvider.info(`Watch initiated on ${cyan(resp.watch)}`);
                CLIENT.command(
                    ['subscribe', resp.watch, `ANGIE_WATCH`, SUB],
                    function (e, resp) {
                        if (e) {
                            throw new Error(e);
                        }
                        CLIENT.on('subscription', function (resp) {
                            if (resp.subscription == `ANGIE_WATCH`) {
                                server([ PORT ]);
                            }
                        });
                    }
                );
            }
        });
    });
}

function server(args) {
    const PORT = $$port(args);

    console.log('CALLING SERVER');

    // Stop any existing webserver
    if (webserver) {
        webserver.close();
    }

    app.$$load().then(function() {

        // Start a webserver
        webserver = (PORT === 443 ? https : http).createServer(function(request, response) {
            const path = url.parse(request.url).pathname;
            let angieResponse = new BaseRequest(path, request, response),
                asset;

            // A file cannot be in the static path if it doesn't have an extension, shortcut
            // TODO you may want to move the asset loading block out of here
            if (path.indexOf('.') > -1) {
                let assetCache = new $CacheFactory('staticAssets');

                if (assetCache.get(path)) {
                    asset = assetCache.get(path);
                } else {
                    asset = $$templateLoader(path, 'static');
                }

                // We have an asset and must render a response
                if (asset) {

                    // Set the content type
                    angieResponse.responseHeaders[ 'Content-Type' ] =
                        $MimeType.fromPath(path);

                    // We do not want to cache responses
                    if (
                        config.hasOwnProperty('cacheStaticAssets') &&
                        !config.cacheStaticAssets
                    ) {
                        angieResponse.responseHeaders = util._extend(
                            angieResponse.responseHeaders,
                            {
                                Expires: -1,
                                Pragma: app.constants.PRAGMA_HEADER,
                                'Cache-Control': app.constants.NO_CACHE_HEADER
                            }
                        );
                    }

                    response.writeHead(
                        200,
                        app.constants.RESPONSE_HEADER_MESSAGES[ '200' ],
                        angieResponse.responseHeaders
                    );

                    // Check if you have an image type asset
                    $LogProvider.info(path, response._header);
                    response.write(asset);
                }

                // End the response
                response.end();
                return;
            }

            // else {

            angieResponse.$$route().then(function() {
                let code = response.statusCode;
                if (!code) {
                    const error = $$templateLoader('500.html');

                    // TODO extrapolate this to responses
                    response.writeHead(
                        500,
                        app.constants.RESPONSE_HEADER_MESSAGES[ '500' ],
                        angieResponse.responseHeaders
                    );
                    response.write(error);
                    $LogProvider.error(path, response._header);
                } else if (code < 400) {
                    $LogProvider.info(path, response._header);
                } else if (code < 500) {
                    $LogProvider.warn(path, response._header);
                } else {
                    $LogProvider.error(path, response._header);
                }
                return true;
            }).then(function() {

                // End the response
                response.end();

                // TODO this seems to cause ERR_INCOMPLETE_CHUNKED_ENCODING
                // request.connection.end();
                // request.connection.destroy();
            });
        }).listen(PORT);

        // Info
        $LogProvider.info(`Serving on port ${PORT}`);
    });
}

function $$port(args) {
    return /\--?usessl/i.test(args) ? 443 : !isNaN(+args[1]) ? +args[1] : 3000;
}

export {watch, server};
