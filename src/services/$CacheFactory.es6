'use strict';

import $log from '../util/$LogProvider';

let cache;

global.__AngieCache__ = cache = {};

class $CacheFactory {
    constructor(key) {
        this.key = key;
        if (!cache[key]) {
            this.cache = cache[key] = {};
        } else {
            $log.warn(`Cache "${key}" already exists`);
            this.cache = cache[key];
        }
        return this;
    }
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
    }
    removeAll(id) {
        cache[this.key] = {};
        return this;
    }
    delete() {
        delete cache[this.key];
        return this;
    }
}

const $cacheFactory = $CacheFactory;
export default $cacheFactory;
