'use strict';

import {app} from '../Angular';
import {$Request} from './$Request';
import {$routeProvider} from './$RouteProvider';
import {$templateLoader} from './$TemplateCache';

const DEFAULT_CONTENT_TYPE = {
    'Content-Type': 'text/html'
};

export default class BaseRequest {
    constructor(path, req, res) {

        // Define URI
        this.path = path;

        // TODO process request here
        this.request = new $Request(req);
        this.response = res;

        // Grab the routes and the otherwise
        this.routes = $routeProvider.fetch().routes;
        this.otherwise = $routeProvider.fetch().otherwise;
    }
    route() {
        // We have three *main* options here

        // If the route exists:
        if (this.routes[this.path]) {
            this.controllerPath();
        } else {
            this.otherPath();
        }
    }
    controllerPath() {

        // TODO define scope

        let controllerName = this.routes[this.path].Controller;
        if (controllerName && app.Controllers[controllerName]) {
            let controller = app.Controllers[controllerName];
            try {

                // TODO we may want to move all instances of this to $injector
                let str = controller.toString(),
                    args = str.match(/(function.*\(.*\))/g)[0]
                        .replace(/(function\s+\(|\))/g, '').trim().split(',');
                this.contoller = controller.apply(
                    app,
                    app.services.$injector.get.apply(app, args)
                );
            } catch(e) {
                this.controller = new controller();
            }
        } else {

            // TODO controller was not found despite being defined
        }

        // TODO get scope
        // TODO compile template with scope
        // TODO See if any views have this Controller associated
        // TODO call that view link with injected scope and services & template
    }
    otherPath() {
        if (this.otherwise) {

            // Redirect the page to a default page
            this.response.statusCode = 302;
            this.response.setHeader('Location', `${this.otherwise}`);
            return;
        }
        this[`${this.path === '/' ? 'default' : 'error'}Path`]();
    }
    defaultPath() {

        // Load default page
        let index = $templateLoader('index.html');

        // Write the response
        this.response.writeHead(200, DEFAULT_CONTENT_TYPE);
        this.response.write(index);
    }
    errorPath() {

        // Load page not found
        let fourOhFour = $templateLoader('404.html');

        this.response.writeHead(404, DEFAULT_CONTENT_TYPE);
        this.response.write(fourOhFour);
    }
}
