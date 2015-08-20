/**
 * @module $Request.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
import url from 'url';

// Angie Modules
import app from '../Angie';

class $Request {
    constructor(request) {
        this.request = request;
        this.request.query = url.parse(request.url, true).query;

        app.service('$request', this.request);
    }
}

export default $Request;