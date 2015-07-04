'use strict'; 'use strong';

class _Promise {
    constructor(fn) {
        this.resolve = function(val) {
            this.val = val;
        };
        if (typeof fn === 'function') {

            // TODO no reject needed yet?
            fn(this.resolve.bind(this));
        }
    }
    then(fn) {
        let val = fn.call(this, this.val);
        this.val = val;
        return this;
    }
    static all(proms) {
        return {
            then: new _Promise().then,
            val: proms
        };
    }
}

/* eslint-disable */
Promise = _Promise;

/* eslint-enable */