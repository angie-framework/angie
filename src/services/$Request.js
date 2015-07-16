'use strict'; 'use strong';

// System Modules
import url from 'url';

// Angie Modules
import app from '../Angular';

class $Request {
    constructor(request) {
        this.request = request;
        this.request.query = url.parse(request.url, true).query;

        app.service('$request', this.request);
    }
}

export default $Request;