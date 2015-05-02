'use strict';

import {app, angular} from './Angular';
import {BaseRequest, DEFAULT_CONTENT_TYPE} from './services/BaseRequest';
import $log from './util/$LogProvider';

const http =        require('http'),
      url =         require('url'),
      path =        require('path'),
      fs =          require('fs'),
      chalk =       require('chalk');

const p = process;

let args = p.argv,
    node = args.indexOf('node');

// Remove trivial arguments
if (node > -1) {
    args.splice(node, 1);
}

export default function server(args) {

    let port = !isNaN(+args.port) ? args.port : 9000;

    $log.warn('"server" not suitable for production use.');

    // Bootstrap the angular application
    angular.bootstrap().then(function() {

        // Start a webserver
        // TODO run the webserver with Gulp and gulp watch project files and angie files to reload
        http.createServer(function(request, response) {

            // TODO check to see if the path contains a static directory, if it does, skip everything else

            let path = url.parse(request.url).pathname;
            new BaseRequest(path, request, response).route();

            let code = response.statusCode;
            if (!code) {
                response.writeHead(500, DEFAULT_CONTENT_TYPE);
                response.write('Invalid Request');
                $log.error(path, response._header);
            } else if (code < 400) {
                $log.info(path, response._header);
            } else if (code < 500) {
                $log.warn(path, response._header);
            } else {
                $log.error(path, response._header);
            }

            response.end();
        }).listen(+port);
    });

    // Info
    $log.info(`Serving on port ${port}`);
}
