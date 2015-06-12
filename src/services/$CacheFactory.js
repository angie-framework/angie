'use strict'; 'use strong';

let g = global;

g.__AngieCache__ = {};

class $CacheFactory {
    constructor(key) {
        this.key = key;
        if (!g.__AngieCache__[ key ]) {
            this.cache = g.__AngieCache__[ key ] = {};
        } else {
            this.cache = g.__AngieCache__[ key ];
        }
    }
    put(id, obj, replace) {
        if (
            (g.__AngieCache__[ this.key ][ id ] && replace) ||
            !g.__AngieCache__[ this.key ][ id ]
        ) {
            this.cache[ id ] = g.__AngieCache__[ this.key ][ id ] = obj;
        }
        return this;
    }
    get(id) {
        return g.__AngieCache__[ this.key ][ id ] || undefined;
    }
    remove(id) {
        delete this.cache[ id ];
        delete g.__AngieCache__[ this.key ][ id ];
        return this;
    }
    removeAll() {
        this.cache = g.__AngieCache__[ this.key ] = {};
        return this;
    }
    delete() {
        delete this.cache;
        delete g.__AngieCache__[ this.key ];
    }
}

export default class $cacheFactory extends $CacheFactory {}
