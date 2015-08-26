/**
 * @module $Responses.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

import app from '../Angie';

class $Response {
    constructor(response) {

        // Define $Response based instance of createServer.prototype.response
        this.response = response;

        // Define the Angie $responseContent string
        this.response.$responseContent = '';
        //app.service('$response', this.response);
    }
}

// TODO use these classes to format responses instead of BaseRequest
// class $APIResponse extends $Response {
//
// }

// class $TemplateResponse extends $Response {
//
// }

export default $Response;
