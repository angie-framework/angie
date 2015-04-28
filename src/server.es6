'use strict';

import {app, angular} from './Angular';
import {$routeProvider} from './services/$RouteProvider';
import {$templateLoader} from './services/$TemplateCache';

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

let port = args[2] || 9000;

export default function server() {
    angular.bootstrap();
    http.createServer(function(req, res) {
        let uri = url.parse(req.url).pathname,
            routes = $routeProvider.fetch().routes,
            otherwise = $routeProvider.fetch().otherwise;

        // TODO build a request service, BaseRequest?
        // TODO export this all to responses? once you figure out what to do with
        // Controllers
        if (routes[uri]) {

            // Let's drop the routes and test uri
            // Default will just return a template
                // You can then return a templateUrl as a url
                // You can call a Constructor, defaults to constructor, or both
            let controllerName = routes[uri].Controller,
                controllerInstance;
            if (controllerName && app.Controllers[controllerName]) {
                let controller = app.Controllers[controllerName];
                try {
                    let str = controller.toString(),
                        args = str.match(/(function.*\(.*\))/g)[0]
                            .replace(/(function\s+\(|\))/g, '').trim().split(',');
                    controllerInstance = controller.apply(
                        app,
                        app.services.$injector.get.apply(app, args)
                    );
                } catch(e) {
                    controllerInstance = new controller();
                }
            }

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

        } else if (otherwise) {
            res.statusCode = 302;
            res.setHeader('Location', `${otherwise}`);
        } else {

            if (uri === '/') {
                res.writeHead(200, {
                    "Content-Type": "text/html"
                });
                res.write($templateLoader('index.html'));
            } else {

                //Move this to responses as well
                res.writeHead(404, {
                    "Content-Type": "text/html"
                });
                res.write($templateLoader(routes['/404'].templateUrl));

            }
        }
        res.end();
        // First get the pathname, check and see if a router exists

    }).listen(+port);
    console.log(chalk.bold(chalk.green(`Angie: [Info] Serving on port ${port}`)));
}

// TODO build a $request service
// TODO log statements for each status
