/**
 * @module $CacheFactory.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var cache = {};

var $CacheFactory = (function () {
    function $CacheFactory(key) {
        _classCallCheck(this, $CacheFactory);

        this.key = key;
        if (!cache[key]) {
            this.cache = cache[key] = {};
        } else {
            this.cache = cache[key];
        }
    }

    _createClass($CacheFactory, [{
        key: "put",
        value: function put(id, obj, replace) {
            if (cache[this.key][id] && replace || !cache[this.key][id]) {
                this.cache[id] = cache[this.key][id] = obj;
            }
            return this;
        }
    }, {
        key: "get",
        value: function get(id) {
            return cache[this.key][id] || undefined;
        }
    }, {
        key: "remove",
        value: function remove(id) {
            delete this.cache[id];
            delete cache[this.key][id];
            return this;
        }
    }, {
        key: "removeAll",
        value: function removeAll() {
            this.cache = cache[this.key] = {};
            return this;
        }
    }, {
        key: "delete",
        value: function _delete() {
            delete this.cache;
            delete cache[this.key];
        }
    }]);

    return $CacheFactory;
})();

exports["default"] = $CacheFactory;
module.exports = exports["default"];