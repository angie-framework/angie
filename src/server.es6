'use strict';

import {app, angular} from './Angular';
import {$routeProvider} from './services/$RouteProvider';
import {$templateLoader} from './services/$TemplateCache';

const http =        require('http'),
      url =         require('url'),
      path =        require('path'),
      fs =          require('fs');

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


        } else if (otherwise) {

        } else {

            // TODO If the root is serving serving, serve the angie root file
            // TODO else serve 404
            //Move this to responses as well
            res.writeHead(404, {
                "Content-Type": "text/html"
            });
            res.write($templateLoader(routes['/404'].templateUrl));
            res.end();
        }
        // First get the pathname, check and see if a router exists

        // If no router exists, check if there is a default
        // If no default, serve default route '/'
    }).listen(+port);
}

//   path.exists(filename, function(exists) {
//     if(!exists) {
//       response.writeHead(404, {"Content-Type": "text/plain"});
//       response.write("404 Not Found\n");
//       response.end();
//       return;
//     }
  //
//     if (fs.statSync(filename).isDirectory()) filename += '/index.html';
  //
//     fs.readFile(filename, "binary", function(err, file) {
//       if(err) {
//         response.writeHead(500, {"Content-Type": "text/plain"});
//         response.write(err + "\n");
//         response.end();
//         return;
//       }
  //
//       response.writeHead(200);
//       response.write(file, "binary");
//       response.end();
//     });
//   });

// TODO default success page on '/'
