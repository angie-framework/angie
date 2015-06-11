'use strict'; 'use strong';

import app from '../Base';
import util from '../util/util';

const url = require('url');

export default class $Request {
    constructor(request) {
        this.request = request;
        this.request.query = url.parse(request.url, true).query;
        app.service('$request', this.request);
    }
}
