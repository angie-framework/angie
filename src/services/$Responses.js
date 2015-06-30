'use strict'; 'use strong';

import app from '../Angular';

class $Response {
    constructor(response) {
        this.response = response;
        app.service('$response', this.response);
    }
}

// TODO use these classes to format responses instead of BaseRequest
class $APIResponse extends $Response {

}

class $TemplateResponse extends $Response {

}

export {$Response};
