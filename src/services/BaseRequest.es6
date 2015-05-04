'use strict';

import {app} from '../Angular';
import $log from '../util/$LogProvider';
import {$Request} from './$Request';
import {$routeProvider} from './$RouteProvider';
import {$templateCache, $templateLoader} from './$TemplateCache';
import $compile from './$Compile';

const DEFAULT_CONTENT_TYPE = {
          'Content-Type': 'text/plain'
      },
      RESPONSE_HEADER_MESSAGES = {
          '200': 'OK',
          '404': 'File Not Found',
          '500': 'Invalid Request'
      };

class BaseRequest {
    constructor(path, request, response) {

        // Cases:
        // Controller & templatePath (default) --> compiles template in scope
        // --> view
        // Controler & template --> compiles template in scope
        // --> view
        // Controller --> fires Controller, expects response
        // --> view
        // templatePath (default) --> serves template, expects compilation on frontend
        // template --> serves template, expects compilation on frontend
        // --> no views

        // Define URI
        this.path = path;

        // Shortcut to set and receive the request object
        this.request = new $Request(request).request;
        this.response = response;

        // Parse out the response content type
        let contentType = this.request.headers['Content-Type'] ||
            this.request.headers.accept || 'text/plain';
        if (contentType.split(',').length) {
            contentType = contentType.split(',')[0];
        }

        this.responseContentType = contentType;
        this.responseHeaders = {
            'Content-Type': this.responseContentType
        };

        // Grab the routes and the otherwise
        this.routes = $routeProvider.fetch().routes;
        this.otherwise = $routeProvider.fetch().otherwise;

        this.responseContent = '';
    }
    route() {

        // If the route exists:
        if (this.routes[this.path]) {
            this.route = this.routes[this.path];

            this.controllerPath();
        } else {
            this.otherPath();
        }
    }
    controllerPath() {

        // TODO define scope

        let controllerName = this.route.Controller;

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
        // ok, our controller has a scope!

        // TODO compile template with scope
        // is there a template?
        try {
            if (
                this.route.template &&
                typeof this.route.template === 'string' &&
                this.route.template.length > 0
            ) {
                this.template = this.route.template;
            } else if (this.route.templatePath) {
                this.template = $templateCache.get(this.route.templatePath);

                if (!this.template) {
                    this.errorPath();
                    return;
                }
            }

            if (this.template) {

                // TODO render the template into the resoponse
                //this.reponseContent = $compile(this.template)(scope);
                this.responseContent = this.template;
            }

            // TODO See if any views have this Controller associated
            for (directive in app.directives) {
                if (directive.Controller && directive.Controller === controllerName) {

                    // TODO move instances of parsing to injector
                    // TODO call that view link with injected scope and services & template
                    // directive.link();
                    if (directive.type === 'APIView') {
                    } else {

                    }
                }
            };
        } catch(e) {
            $log.error(e);
            this.response.writeHead(
                500,
                RESPONSE_HEADER_MESSAGES['500'],
                this.responseHeaders
            );
            this.response.write(`<h1>${RESPONSE_HEADER_MESSAGES['500']}</h1>`);
            return;
        }

        this.response.writeHead(
            200,
            RESPONSE_HEADER_MESSAGES['200'],
            this.responseHeaders
        );
        this.response.write(this.responseContent);
    }
    otherPath() {
        if (this.otherwise) {

            // Redirect the page to a default page
            // TODO test otherwise redirects to absolute path or full link
            this.response.statusCode = 302;
            this.response.setHeader('Location', `${this.otherwise}`);
            return;
        }

        this[ `${this.path === '/' ? 'default' : 'error'}Path` ]();
    }
    defaultPath() {

        // Load default page
        let index = $templateLoader('index.html');

        // If the index page could not be found
        if (!index) {
            this.errorPath();
            return;
        }

        // Write the response
        this.response.writeHead(
            200,
            RESPONSE_HEADER_MESSAGES['200'],
            this.responseHeaders
        );
        this.response.write(index);
    }
    errorPath() {

        // Load page not found
        let fourOhFour = $templateLoader('404.html');

        this.response.writeHead(
            404,
            RESPONSE_HEADER_MESSAGES['404'],
            this.responseHeaders
        );
        this.response.write(fourOhFour);
    }
}

export {BaseRequest, DEFAULT_CONTENT_TYPE};
