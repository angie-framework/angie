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

const CWD = process.cwd(),
    CLIENT = new Client(),
    WATCH_DIRS = [
        CWD,
        __dirname
    ].concat(app._$dependencies__),
    SUB = {
        expression: [ 'allof', [ 'match', '*.js' ] ],
        fields: []
    };
let webserver;
// let firstrun = true;

// TODO watchman implementation, change these names
function watch(args) {
    const port = $$port(args);
    // TODO you have to do this for each of the dirs
    return CLIENT.capabilityCheck({}, function (e, resp) {
        if (e) {
            throw new Error(e);
        }
        console.log('DO I GET HERE', resp);
        CLIENT.command([ `watch-project`, CWD ], function (e, resp) {
            if (e) {
                throw new Error(e);
            } else if ('warning' in resp) {
                $LogProvider.warn(resp.warning);
            } else {

                $LogProvider.info(`Watch initiated on ${cyan(resp.watch)}`);
                CLIENT.command(
                    ['subscribe', resp.watch, 'mysubscription', SUB],
                    function (error, resp) {
                        if (error) {
                            //console.error('failed to subscribe: ', error);
                        }
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
                    }
                );
            }
        });
    });
}

function server(args) {
    const port = $$port(args);

    // Stop any existing webserver
    if (webserver) {
        webserver.close();
    }

    app.$$load().then(function() {

        // Start a webserver
        webserver = (port === 443 ? https : http).createServer(function(request, response) {
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

            // }

        }).listen(port);

        // Info
        $LogProvider.info(`Serving on port ${port}`);
    });
}

function $$port(args) {
    return /\--?usessl/i.test(args) ? 443 : !isNaN(+args[1]) ? +args[1] : 3000;
}

export {watch, server};
