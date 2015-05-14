'use strict';

const util = {

    // TODO keep this light for now, single target, single arg
    extend: function extend() {
        var target = arguments[0] || {},
            obj = arguments[1] || {};

        if (typeof target === 'object' && typeof obj === 'object') {
            for (let key in obj) {
                target[key] = obj[key];
            }
        }

        return target;
    }
};

export default util;
