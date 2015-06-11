'use strict'; 'use strong';

// import $log from '../util/$LogProvider';

let cache;

global.__AngieCache__ = cache = {};

class $CacheFactory {

    /**
     * @class
     * @service
     * @name $CacheFactory
     * @alias $cacheFactory
     * @description Creates a Cache instance
     * @param {string} key The name of the instantiated cache
     */
    constructor(key) {
        this.key = key;
        if (!cache[key]) {
            this.cache = cache[key] = {};
        } else {
            this.cache = cache[key];
        }
    }

    /**
     * @method
     * @memberof $CacheFactory
     * @name put
     * @param {string} id The name of the key in the cache
     * @param {string|object|boolean|undefined|number}
     obj The value of the key in the cache
     * @param {boolean} replace Should existing keys be replaced?
     */
    put(id, obj, replace) {
        if ((cache[this.key][id] && replace) || !cache[this.key][id]) {
            cache[this.key][id] = obj;
        }
        return this;
    }
    get(id) {
        return cache[this.key][id] || undefined;
    }
    remove(id) {
        delete cache[this.key][id];
        return this;
    }
    removeAll() {
        cache[this.key] = {};
        return this;
    }
    delete() {
        delete cache[this.key];
    }
}

const $cacheFactory = $CacheFactory;
export default $cacheFactory;
