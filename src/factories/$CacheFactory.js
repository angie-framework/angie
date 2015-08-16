/**
 * @module Angie.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

let cache = {};

class $CacheFactory {
    constructor(key) {
        this.key = key;
        if (!cache[ key ]) {
            this.cache = cache[ key ] = {};
        } else {
            this.cache = cache[ key ];
        }
    }
    put(id, obj, replace) {
        if (
            (cache[ this.key ][ id ] && replace) ||
            !cache[ this.key ][ id ]
        ) {
            this.cache[ id ] = cache[ this.key ][ id ] = obj;
        }
        return this;
    }
    get(id) {
        return cache[ this.key ][ id ] || undefined;
    }
    remove(id) {
        delete this.cache[ id ];
        delete cache[ this.key ][ id ];
        return this;
    }
    removeAll() {
        this.cache = cache[ this.key ] = {};
        return this;
    }
    delete() {
        delete this.cache;
        delete cache[ this.key ];
    }
}

export default $CacheFactory;
