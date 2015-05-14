'use strict';

import {config} from './Config';
import app from './Base';
import $cacheFactory from './services/$CacheFactory';
import {$templateLoader} from './services/$TemplateCache';
import {
    BaseRequest,
    RESPONSE_HEADER_MESSAGES
} from './services/BaseRequest';
import __mimetypes__ from './util/MimeTypes';
import $log from './util/$LogProvider';

const http =        require('http'),
      url =         require('url'),
      watch =       require('node-watch');

const p = process;

let firstrun = true,
    port;

export default function server(args) {
    port = !isNaN(+args.port) ? args.port : 3000;

    if (firstrun) {
        $log.warn('"server" not suitable for production use.');
    }

    prepApp().then(function() {

        // Start a webserver
        // TODO run the webserver with Gulp and gulp watch project files and angie files to reload
        http.createServer(function(request, response) {
            let path = url.parse(request.url).pathname,
                angieResponse = new BaseRequest(path, request, response),
                asset;

            // A file cannot be in the static path if it doesn't have an extension, shortcut
            if (path.indexOf('.') > -1) {
                let assetCache = new $cacheFactory('staticAssets'),
                    assetPath = path.split('/').pop();

                if (assetCache.get(assetPath)) {
                    asset = assetCache.get(assetPath);
                } else {
                    asset = $templateLoader(assetPath, 'static');
                }

                // We have an asset and must render a response
                if (asset) {

                    let contentType;

                    // TODO mimetypes should never return undefined
                    if (__mimetypes__[ path.split('.').pop() ]) {
                        contentType = __mimetypes__[
                            path.split('.').pop()
                        ];
                    } else {
                        contentType = 'text/plain';
                    }

                    // Write the head
                    angieResponse.responseHeaders[ 'Content-Type' ] = contentType;
                    response.writeHead(
                        200,
                        RESPONSE_HEADER_MESSAGES['200'],
                        angieResponse.responseHeaders
                    );

                    // Check if you have an image type asset
                    response.write(asset);
                    $log.info(path, response._header);
                } else {

                    // We have no asset and must render a response
                    const error = $templateLoader('404.html');

                    // TODO extrapolate this to responses
                    response.writeHead(
                        404,
                        RESPONSE_HEADER_MESSAGES['404'],
                        angieResponse.responseHeaders
                    );
                    response.write(error);
                    $log.warn(path, response._header);
                }
            } else {
                angieResponse.route();

                let code = response.statusCode;
                if (!code) {
                    const error = $templateLoader('500.html');

                    // TODO extrapolate this to responses
                    response.writeHead(
                        500,
                        RESPONSE_HEADER_MESSAGES['500'],
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
            }

            response.end();

            // TODO this seems to cause ERR_INCOMPLETE_CHUNKED_ENCODING
            // request.connection.end();
            // request.connection.destroy();
        }).listen(+port);

        // Attempt to restart the webserver on change
        if (firstrun) {
            let watchDirs = [ p.cwd(), __dirname ].concat(app.__dependencies__);

            try {
                let restartObj = {
                        persistent: true,
                        recursive: true
                    };
                watch(watchDirs, (() => restart()), restartObj);
            } catch(e) {
                $log.error(e);
            }
        }

        // Info
        $log.info(`Serving on port ${port}`);

        // Set firstrun to false
        firstrun = false;
    });
}

function restart() {

    // TODO this doesn't reload like you think it does
    prepApp().then(function() {
        $log.info(`Application files reloaded; Still serving on port ${port}`);
    });

    // TODO live reload
}

function prepApp() {

    // Load any app dependencies
    return app.loadDependencies(config.dependencies).then(function() {

        // Bootstrap the angular application
        return new Promise((resolve) => app.bootstrap().then(resolve));
    });
}
