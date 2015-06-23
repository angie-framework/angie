'use strict'; 'use strong';

// System Modules
import url from 'url';

// Angie Modules
import app from '../Base';

export default class $Request {
    constructor(request) {
        this.request = request;
        this.request.query = url.parse(request.url, true).query;

        app.service('$request', this.request);
    }
}
