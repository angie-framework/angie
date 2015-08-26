    /**
     * @desc $controllerPath is fired once a request has been routed. It fires
     * the controller once dependencies have been injected.
     *
     * Cases:
     *     Controller & templatePath (default): Compiles template in scope
     *     Controler & template: Compiles template in scope
     *     Controller: fires Controller, expects response
     *     TemplatePath (default): Serves template, expects compilation on
     * frontend
     *     Template: Serves template, expects compilation on frontend
     *
     * If the loadDefaultScriptFile option is added to AngieFile.json with a
     * valid (existing and of type ".js") JavaScript filename, this default
     * script file will be loaded.
     * @todo add documentation on views
     * @since 0.2.3
     * @access private
     */
    $controllerPath() {
        let me = this,
            prom;

        // TODO move all of this out to responses
        prom = new Promise(function(resolve, reject) {

            // TODO despite the fact that controllerName is kind of a misnomer,
            // because this can be a function, it is ok for now
            let controllerName = me.route.Controller;

            // Get controller and compile scope
            if (controllerName) {
                if (
                    app.Controllers[ controllerName ] ||
                    typeof controllerName === 'function'
                ) {

                    // Check to see if the Controller in the Route is a function
                    let controller = typeof me.route.Controller !== 'function' ?
                        app.Controllers[ controllerName ] : controllerName;

                    app.Controller = app.services.$response.Controller = {
                        done: resolve
                    };

                    me.controller = new $injectionBinder(
                        controller,
                        'controller'
                    ).call(
                        app.services.$scope,
                        resolve
                    );
                    if (
                        !me.controller ||
                        !me.controller.constructor ||
                        me.controller.constructor.name !== 'Promise'
                    ) {
                        resolve(controllerName);
                    }
                } else {

                    // TODO controller was not found despite being defined?
                    // TODO exception
                    reject(`No Controller named "${controllerName}" could be found`);
                }
            } else {
                resolve(controllerName);
            }
        });

        // Find and load template
        prom = prom.then(function(controllerName) {
            let mime;

            if (
                me.route.template &&
                typeof me.route.template === 'string' &&
                me.route.template.length > 0
            ) {
                me.template = me.route.template;
            } else if (me.route.templatePath) {
                let template = $templateCache.get(me.route.templatePath);

                // Check to see if we can associate the template path with a
                // mime type
                mime = $MimeType.fromPath(me.route.templatePath);


                // Check the caching options for static assets
                // This should only be for templatePaths with "."'s,
                // all others should apply to caching options
                if (
                    me.route.templatePath.indexOf('.') > -1 &&
                    config.hasOwnProperty('cacheStaticAssets') &&
                    !config.cacheStaticAssets
                ) {

                    // If there is a template, check to see if caching is set
                    me.responseHeaders = $Util._extend(me.responseHeaders, {
                        Expires: -1,
                        Pragma: app.constants.PRAGMA_HEADER,
                        'Cache-Control': app.constants.NO_CACHE_HEADER
                    });
                }

                me.responseHeaders[ 'Content-Type' ] = mime;
                me.template = template;
            }

            // If there is a template/templatePath defined we should have a template
            if (!me.template) {
                if (me.route.template || me.route.templatePath) {
                    return me.unknownPath();
                }
            } else {

                // If we have any sort of template
                let match = me.template.toString().match(/!doctype ([a-z]+)/i);

                // In the context where MIME type is not set, but we have a
                // DOCTYPE tag, we can force set the MIME
                // We want this here instead of the explicit template definition
                // in case the MIME failed earlier
                if (match) {
                    mime = me.responseHeaders[ 'Content-Type' ] =
                        $MimeType.$$(match[1].toLowerCase());
                }

                // Check to see if this is an HTML template and has a DOCTYPE
                // and that the proper configuration options are set
                if (
                    (
                        mime || me.responseHeaders[ 'Content-Type' ]
                    ) === 'text/html' &&
                    config.loadDefaultScriptFile &&
                    (
                        !me.route.hasOwnProperty('useMainScriptFile') ||
                        me.route.useDefaultScriptFile !== false
                    )
                ) {

                    // Check that option is not true
                    let scriptFile = config.loadDefaultScriptFile === true ?
                        'application.js' : config.loadDefaultScriptFile;
                    $resourceLoader(scriptFile);
                }

                // Pull the response back in from wherever it was before
                me.responseContent = me.response.$responseContent;

                // Render the template into the resoponse
                return new Promise(function(resolve) {

                    // $Compile to parse template strings and app.directives
                    return $compile(me.template)(

                        // In the context of the scope
                        app.services.$scope
                    ).then(function(template) {
                        resolve(template);
                    });
                }).then(function(template) {
                    me.responseContent += template;
                    me.response.$responseContent = me.responseContent;

                    return controllerName;
                });
            }
        });

        prom.then(function() {
            me.response.writeHead(
                200,
                app.constants.RESPONSE_HEADER_MESSAGES[ '200' ],
                me.responseHeaders
            );
            me.response.write(me.responseContent);
        });

        prom.catch(function(e) {
            $LogProvider.error(e);
            return me.errorPath();
        });

        return prom;
    }
    otherPath() {
        let me = this;

        if (this.otherwise) {

            // Redirect the page to a default page
            // TODO test otherwise redirects to absolute path or full link
            return new Promise(function() {
                me.response.statusCode = 302;
                me.response.setHeader('Location', `${me.otherwise}`);
                arguments[0]();
            });
        }

        return this[ `${ this.path === '/' ? 'default' : 'unknown' }Path` ]();
    }
    defaultPath() {

        // Load default page
        let index = $$templateLoader('index.html');

        // If the index page could not be found
        if (!index) {
            return this.unknownPath();
        }

        // Write the response
        let me = this;
        return new Promise(function() {
            me.response.writeHead(
                200,
                app.constants.RESPONSE_HEADER_MESSAGES['200'],
                me.responseHeaders
            );
            me.response.write(index);
            arguments[0]();
        });
    }
    unknownPath() {

        // Load page not found
        let fourOhFour = $$templateLoader('404.html'),
            me = this;

        return new Promise(function() {
            me.response.writeHead(
                404,
                app.constants.RESPONSE_HEADER_MESSAGES['404'],
                me.responseHeaders
            );
            me.response.write(fourOhFour);
        });
    }
    errorPath() {
        this.response.writeHead(
            500,
            app.constants.RESPONSE_HEADER_MESSAGES[ '500' ],
            this.responseHeaders
        );
        this.response.write(
            `<h1>${app.constants.RESPONSE_HEADER_MESSAGES[ '500' ]}</h1>`
        );
    }
}

//export {BaseRequest};

// TODO break up this file
    // BaseRequest
        // Asset Request
        // ControllerRequest
            // ControllerWithTemplate
            // ControllerWithTemplatePath
            // ControllerWithView
        // UnkownRequest
        // ErrorRequest