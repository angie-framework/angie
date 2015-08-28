/**
 * @module Server.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
import repl from                    'repl';
import http from                    'http';
import https from                   'https';
import {Client} from                'fb-watchman';
import {cyan} from                  'chalk';
import $LogProvider from            'angie-log';

// Angie Modules
import {config} from                './Config';
import app from                     './Angie';
import $Request from                './services/$Request';
import $Response from               './services/$Response';

const CLIENT = new Client(),
    SUB = {
        expression: [
            'anyof', [ 'match', '*.js' ], [ 'match', '*.es6' ] ],
        fields: []
    };
let webserver,
    shell;

/**
 * @desc $$watch is an Angie implementation of Facebook Watchman for NodeJS.
 *
 * It is mentioned in the README that to use the `watch` command, it is
 * necessary to install the Watchman binaries.
 *
 * This is the function that fires when the `angie watch` command is issued. It
 * will subscribe to the target project folder by default. If passed the "devmode"
 * argument, the script will subscribe to the Angie source files.
 *
 * On change to, addition of, or removal of files from the subscribed to
 * directory, the $$watch function will restart the $$server/$$shell depending
 * on the issued action.
 * @since 0.3.2
 * @param {Array} [param=[]] args An array of CLI arguments piped into the
 * function
 * @access private
 */
function $$watch(args = []) {
    const PORT = $$port(args),
        ACTION = args[0] || 'watch',
        WATCH_DIR = /--?devmode/i.test(args) ? __dirname : process.cwd();

    // Check to see whether or not the config specifies the app as `development`
    // and we are creating a web server. If so, pose the user with a warning:
    if (config.development !== true && ACTION === 'watch') {
        $LogProvider.warn(
            `It is not necessary or wise to issue the ${cyan('watch')} ` +
            'command in production'
        );
    }

    return new Promise(function(resolve) {

        // Verify that the user actually has Facebook Watchman installed
        CLIENT.capabilityCheck({}, function (e, r) {
            if (e) {
                throw new Error(e);
            }
            resolve(r);
        });
    }).then(function() {
        return new Promise(function(resolve) {
            CLIENT.command([ `watch-project`, WATCH_DIR ], function (e, r) {
                if (e) {
                    throw new Error(e);
                }
                if ('warning' in r) {
                    $LogProvider.warn(r.warning);
                }
                resolve(r);
            });
        }).then(function(r) {
            $LogProvider.info(`Watch initiated on ${cyan(r.watch)}`);

            return new Promise(function(resolve) {
                CLIENT.command([
                    'subscribe',
                    r.watch,
                    `ANGIE_WATCH`,
                    SUB
                ], function (e, r) {
                    if (e) {
                        throw new Error(e);
                    }
                    resolve(r);
                });
            }).then(function() {
                CLIENT.on('subscription', function (r) {
                    if (r.subscription === 'ANGIE_WATCH') {
                        (args[0] && args[0] === 'watch' ? $$server : $$shell)(
                            [ PORT ]
                        );
                    }
                });
            });
        });
    }).catch(function(e) {
        throw new Error(e);
    });
}

/**
 * @desc $$shell uses the NodeJS REPL to open an Angie-based shell
 *
 * Before load, the $$shell command will load all file dependencies of the
 * target application. All application components will be available in the
 * shell.
 *
 * The $$shell function is only called as a byproduct of the `angie watch`
 * command and will reload all application files on save, on creation, or on
 * removal in the directory specified to the $$watch function.
 * @since 0.3.2
 * @access private
 */
function $$shell() {
    const P = process,
        SHELL_PROMPT = 'angie > ';

    if (shell) {
        P.stdout.write('\n');
    }

    return app.$$load().then(function() {
        P.stdin.setEncoding('utf8');

        // Start a REPL after loading project files
        if (!shell) {
            shell = repl.start({
                prompt: SHELL_PROMPT,
                input: P.stdin,
                output: P.stdout
            });
        } else {
            P.stdout.write(SHELL_PROMPT);
        }
    });
}

/**
 * @desc $$server uses the NodeJS http/https to open an Angie-based web server
 *
 * Before load, the $$server command will load all file dependencies of the
 * target application. All application components will be available to the
 * application running behind the server.
 *
 * The $$server function can be called as a byproduct of the `angie watch`
 * command in which case it will reload all application files on save,
 * on creation, or on removal in the directory specified to the $$watch function.
 * It can also be called independently of the Facebook Watchman application by
 * issuing the `angie server` or `angie s` commands from the CLI.
 * @since 0.3.2
 * @param {Array} [param=[]] args An array of CLI arguments piped into the
 * function
 * @access private
 */
function $$server(args = []) {
    const PORT = $$port(args);

    // Stop any existing webserver
    if (webserver) {
        webserver.close();
    }

    app.$$load().then(function() {

        // Start a webserver
        webserver = (PORT === 443 ? https : http).createServer(function(req, res) {
            let request = new $Request(req),
                response = new $Response(res).response;

            app.service('$request', request.request).service('$response', response);

            request.$$route().then(function() {
                let code = res.statusCode;
                if (!code) {
                    $LogProvider.error(request.path, res._header);
                } else if (code < 400) {
                    $LogProvider.info(request.path, res._header);
                } else if (code < 500) {
                    $LogProvider.warn(request.path, res._header);
                } else {
                    $LogProvider.error(request.path, res._header);
                }

                // End the response
                res.end();
            });

            // After we have finished with the response, we can tear down
            // request/response specific components
            app.$$tearDown([ '$request', '$response' ]);
        }).listen(PORT);

        // Info
        $LogProvider.info(`Serving on port ${PORT}`);
    });
}

function $$port(args) {
    return /\--?usessl/i.test(args) ? 443 : !isNaN(+args[1]) ? +args[1] : 3000;
}

export {
    $$watch,
    $$server,

    // Exposed for testing purposes
    $$shell
};
