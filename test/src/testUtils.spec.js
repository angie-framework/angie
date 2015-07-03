'use strong'; 'use strict';

// System Modules
import simple from  'simple-mock';

class _Promise {
    constructor(fn) {
        this.resolve = simple.spy();
        if (typeof fn === 'function') {

            // TODO no reject needed yet?
            fn(this.resolve);
        }
    }
    then(fn) {
        let val = fn.call(this, this.val);
        this.val = val;
        return this;
    }
    static all(proms) {
        proms.forEach(function(prom) {
            if (typeof prom === 'function') {
                prom();
            }
        });
        return new _Promise();
    }
};

global.Promise = _Promise;