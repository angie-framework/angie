/**
 * @module $ScopeProvider.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var handlers = [];

/**
 * @desc $ScopeProvider is the parent class on which all of the content shared
 * across the request can be shared. It also provides methods for messaging
 * against and across the scope.
 * @since 0.3.1
 * @access private
 */

var $$ScopeProvider = (function () {
    function $$ScopeProvider() {
        _classCallCheck(this, $$ScopeProvider);

        this.$$id = 1;
    }

    /**
     * @desc $scope is the instance of $$ScopeProvider allocated to resources
     * @since 0.3.1
     * @access private
     */

    /**
     * @desc Sets up an event listener on the scope
     * @since 0.3.1
     * @param {string} name The name of the message to call the event listener
     * @param {function} fn The handler to call on message
     * @returns {boolean} A representation of whether the listener was attached
     * @access public
     * @example $scope.$on('test', () => undefined);
     */

    _createClass($$ScopeProvider, [{
        key: '$on',
        value: function $on(name, fn) {
            if (typeof fn === 'function') {
                handlers.push(_defineProperty({}, name, fn));
                return true;
            }
            return false;
        }

        /**
         * @desc Calls an event listener on the scope
         * @since 0.3.1
         * @param {string} name The name of the message to call the event listener
         * @param {boolean} async Should the handlers be called async?
         * @returns {boolean} A representation of whether the listeners were called
         * @access public
         * @example $scope.$broadcast('test', true);
         */
    }, {
        key: '$broadcast',
        value: function $broadcast(name, async) {
            var args = Array.from(arguments).splice(0, 1);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = handlers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var handler = _step.value;

                    if (handler.hasOwnProperty(name)) {
                        if (async) {
                            setImmediate(handler[name].bind(null, args));
                        } else {
                            handler[name](args);
                        }
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator['return']) {
                        _iterator['return']();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
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
    }, {
        key: '$watch',
        value: function $watch(key, fn) {
            return Object.observe(this[key], fn);
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
    }, {
        key: '$$off',
        value: function $$off(name) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = handlers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var handler = _step2.value;

                    if (handler.hasOwnProperty(name)) {
                        handlers.splice(handlers.indexOf(handler), 1);
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                        _iterator2['return']();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
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
    }, {
        key: '$$removeWatch',
        value: function $$removeWatch(obj) {
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
    }, {
        key: '$$handlers',
        value: function $$handlers($handlers) {
            return handlers = $handlers || handlers;
        }
    }]);

    return $$ScopeProvider;
})();

var $scope = new $$ScopeProvider();
exports['default'] = $$ScopeProvider;
exports.$scope = $scope;