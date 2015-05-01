'use strict';

import {app, angular} from './Angular';
import BaseRequest from './services/BaseRequest';

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

    angular.bootstrap();
    http.createServer(function(request, response) {

        let path = url.parse(request.url).pathname;
        new BaseRequest(path, request, response).route();

        // No matter what, this response must end
        response.end();
    }).listen(+port);
    console.log(chalk.bold(chalk.green(`Angie: [Info] Serving on port ${port}`)));
}

// TODO log statements for each status

// Cases:
// Controller & templateUrl (default) --> compiles template in scope
// --> view
// Controler & template --> compiles template in scope
// --> view
// Controller --> fires Controller, expects response
// --> view
// templateUrl (default) --> serves template, expects compilation on frontend
// template --> serves template, expects compilation on frontend
// --> no views
