'use strict';

let $request = {};

class $Request {
    constructor(request) {
        $request = this.request = request;
        return this;
    }
}

export {$Request, $request};
