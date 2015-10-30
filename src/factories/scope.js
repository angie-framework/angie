/**
 * @module $ScopeProvider.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
import uuid from        'node-uuid';
import $Injector from   'angie-injector';

// TODO sessionStorage should have persistence options
let sessionStorage,
    handlers = [];

// Clear out stale sessions
setInterval(function() {
    if (typeof sessionStorage === 'object') {
        for (let key of sessionStorage) {
            let value = sessionStorage[ key ];

            if (+value.expiry < +new Date()) {
                delete sessionStorage[ key ];
            }
        }
    }
}, 300);

/**
 * @desc $ScopeProvider is the parent class on which all of the content shared
 * across the request can be shared. It also provides methods for messaging
 * against and across the scope.
 * @since 0.3.1
 * @access private
 */
class $$ScopeFactory {
    constructor() {
        this.$$id = 1;
        this.$$bindings = {};
    }


    $bind(key, model, ignoreKeys) {


        // First we need to check that the key actually exists on the $scope
        if (this.hasOwnProperty(key)) {

            // TODO warning if key does not map to an object value

            // The key exists in some capacity on the scope, we need to validate
            // that the model exists
            if (typeof model === 'string') {

                // Attempt to look up our model by name
                model = $Injector.get(model);
            }

            if (typeof model === 'object') {
                let valid = false;

                console.log(model);

                // We now need to compare the keys on the $scope value and on
                // the model
                // TODO we ignore keys if they are in ignoreKeys and
                // non-required on the model
                for (let key in model) {
                    let value = model[ key ];

                    // Check to see if the key is a field

                    // TODO If the scope is an array check that each instance has
                    // the values. Honestly, I'm not even sure this is necessary,
                    // we may not want to check this, we may just want the mappings
                    // to emerge organically

                    valid = true;
                }

                // TODO add iid to $scope property as a mapping for ids

                if (valid) {
                    this.$$bindings[ key ] = model.name;
                }
            }
        }

        // TODO throw a binding error
    }

    $createBinding() {
        return this.$bind.apply(this, arguments);
    }

    /**
     * @desc Sets up an event listener on the scope
     * @since 0.3.1
     * @param {string} name The name of the message to call the event listener
     * @param {function} fn The handler to call on message
     * @returns {boolean} A representation of whether the listener was attached
     * @access public
     * @example $scope.$on('test', () => undefined);
     */
    $on(name, fn) {
        if (typeof fn === 'function') {
            handlers.push({ [ name ]: fn });
            return true;
        }
        return false;
    }

    /**
     * @desc Calls an event listener on the scope
     * @since 0.3.1
     * @todo Replace `Array.prototype.slice.call` with `Array.from` when it is
     * supported without the polyfill
     * @param {string} name The name of the message to call the event listener
     * @param {boolean} async Should the handlers be called async?
     * @returns {boolean} A representation of whether the listeners were called
     * @access public
     * @example $scope.$broadcast('test', true);
     */
    $broadcast(name, async) {
        let args = Array.prototype.slice.call(arguments).splice(0, 1);
        for (let handler of handlers) {
            if (handler.hasOwnProperty(name)) {
                if (async) {
                    setImmediate(handler[ name ].bind(null, args));
                } else {
                    handler[ name ](args);
                }
            }
        }
        return true;
    }

    /**
     * @desc Sets up an observer on an object (shallow). This function does not
     * support dots.
     * @since 0.3.1
     * @todo deep watch
     * @param {object} obj The object upon which to set up the handler
     * @param {function} fn The handler to call on message
     * @returns {object} The passed object
     * @access public
     * @example $scope.$watch({}, () => undefined);
     */
    $watch(key, fn) {
        return Object.observe(this[ key ], fn);
    }

    /**
     * @desc Sets up an observer on an object (deep). This function does not
     * support dots.
     * @since 0.3.1
     * @param {object} obj The object upon which to set up the handler
     * @param {function} fn The handler to call on message
     * @access public
     * @example $scope.$watchCollection({ test: {} }, () => undefined);
     */
    // $watchCollection(key, fn) {
    //     let me = this;
    //     Object.observe(this[ key ], function(changes) {
    //         changes.forEach(function(change) {
    //             if (typeof me[ key ][ change.name ] === 'object') {
    //                 me.$watch(me[ key ][ change.name ], fn);
    //             }
    //         });
    //         fn.apply(me, arguments);
    //     });
    // }

    /**
     * @desc Removes all of the handlers from a listener
     * @since 0.3.1
     * @param {string} name The name of the message to call the event listener
     * @returns {boolean} A representation of whether the listeners were attached
     * @access public
     * @example $scope.$off('test');
     */
    $$off(name) {
        for (let handler of handlers) {
            if (handler.hasOwnProperty(name)) {
                handlers.splice(handlers.indexOf(handler), 1);
            }
        }
        return true;
    }

    /**
     * @desc Removes all of the watchers from an object
     * @since 0.3.1
     * @todo deep unwatch
     * @param {object} obj The object from which to remove the handler
     * @returns {boolean} A representation of whether the listeners were unattached
     * @access public
     * @example $scope.$$removeWatch({});
     */
    $$removeWatch(obj) {
        Object.unwatch(obj);

        return true;
    }

    /**
     * @desc Sets up or removes all handlers
     * @since 0.3.1
     * @param {Array} $handlers An optional list of handlers
     * @returns {Array} handlers
     * @access private
     */
    $$handlers($handlers) {
        return (handlers = $handlers || handlers);
    }
}

function $$fetch() {
    const [ $Cookie, $Cache ] = $Injector.get('$Cookie', '$Cache'),
        obj = {
            $scope: new $$ScopeFactory(),
            expiry: 1
        },
        sessionStorage = new $Cache('sessions');
    let sessionId = $Cookie.get('ANGIE_SESSION_COOKIE');

    // Now, look too see if we already have an ANGIE_SESSION_COOKIE
    if (!sessionId) {
        sessionId = uuid.v4();
        $Cookie.set('ANGIE_SESSION_COOKIE', sessionId);
    }

    sessionStorage.put(sessionId, obj);
    return obj.$scope;
}

export default $$ScopeFactory;
export { $$fetch };