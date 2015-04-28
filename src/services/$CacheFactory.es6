'use strict';

let cache;

global.__AngieCache__ = cache = {};

class $CacheFactory {
    constructor(key) {
        this.key = key;
        if (!cache[key]) {
            cache[key] = {};
        }
        return this;
    }
    put(id, obj) {
        cache[this.key][id] = obj;
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

export {$CacheFactory as $cacheFactory};
