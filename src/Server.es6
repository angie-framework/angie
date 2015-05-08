'use strict';

import angular from './Angular';
import app from './Base';
import $cacheFactory from './services/$CacheFactory';
import {$templateLoader} from './services/$TemplateCache';
import {BaseRequest, DEFAULT_CONTENT_TYPE, RESPONSE_HEADER_MESSAGES} from './services/BaseRequest';
import $log from './util/$LogProvider';

const http =        require('http'),
      url =         require('url'),
      path =        require('path'),
      chalk =       require('chalk'),
      watch =       require('node-watch');

const p = process;

let args = p.argv,
    node = args.indexOf('node'),
    firstrun = true,
    port;

// Remove trivial arguments
if (node > -1) {
    args.splice(node, 1);
}

function restart() {
    angular.bootstrap().then(function() {
        $log.info(`Application files reloaded; Still serving on port ${port}`);
    });
}

export default function server(args) {
    let runserver;

    port = !isNaN(+args.port) ? args.port : 9000;

    if (firstrun) {
        $log.warn('"server" not suitable for production use.');
    }

    // Bootstrap the angular application
    angular.bootstrap().then(function() {

        // Start a webserver
        // TODO run the webserver with Gulp and gulp watch project files and angie files to reload
        runserver = http.createServer(function(request, response) {
            let path = url.parse(request.url).pathname,
                angieResponse = new BaseRequest(path, request, response),
                asset;

            // A file cannot be in the static path if it doesn't have an extension, shortcut
            if (path.indexOf('.') > -1) {
                let assetCache = new $cacheFactory('staticAssets'),
                    assetPath = path.split('/').pop();

                if (assetCache.get(path)) {
                    asset = assetCache.get(assetPath);
                } else {
                    asset = $templateLoader(assetPath, 'static');
                }

                // If we have an asset at this point, there is little more to do
                if (asset) {
                    response.writeHead(
                        200,
                        RESPONSE_HEADER_MESSAGES['200'],
                        angieResponse.responseHeaders
                    );
                    response.write(asset);
                    response.end();
                    return;
                }
            }

            angieResponse.route();

            let code = response.statusCode;
            if (!code) {
                const error = $templateLoader('500.html');
                response.writeHead(
                    500,
                    'Invalid Request',
                    angieResponse.responseHeaders
                );
                response.write(error);
                $log.error(path, response._header);
            } else if (code < 400) {
                $log.info(path, response._header);
            } else if (code < 500) {
                $log.warn(path, response._header);
            } else {
                $log.error(path, response._header);
            }

            response.end();
            request.connection.end();
            request.connection.destroy;
        }).listen(+port);

        // Info
        $log.info(`Serving on port ${port}`);
    });

    // Attempt to restart the webserver on change
    if (firstrun) {
        try {
            let restartObj = {
                    persistent: true,
                    recursive: true
                };
            watch([
                p.cwd(),
                __dirname
            ], (() => restart()), restartObj);
        } catch(e) {
            $log.error(e);
        }
    }

    // Set firstrun to false
    firstrun = false;
}
