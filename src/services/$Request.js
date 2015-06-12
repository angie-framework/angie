'use strict'; 'use strong';

import app from '../Base';

const url = require('url');

export default class $Request {
    constructor(request) {
        this.request = request;
        this.request.query = url.parse(request.url, true).query;
        app.service('$request', this.request);
    }
}
