/**
 * @module $Responses.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
import {default as $Injector} from  'angie-injector';

// Angie Modules
// import app from '../Angie';
import {default as $MimeType} from  '../util/$MimeTypeProvider';

class $Response {
    constructor(response) {

        // Define $Response based instance of createServer.prototype.response
        this.response = response;

        // Define the Angie $responseContent string
        this.response.$responseContent = '';
        //app.service('$response', this.response);
    }
}

const RESPONSE_HEADER_MESSAGES = $Injector.get('RESPONSE_HEADER_MESSAGES');

class BaseResponse {
    constructor() {
        let request,
            contentType;
        [ this.response, request ]  = $Injector.get('$response', '$request');

        // Parse out the response content type
        contentType = request.headers.accept;
        if (contentType && contentType.indexOf(',') > -1) {
            contentType = contentType.split(',')[0];
        } else {
            contentType = $MimeType.fromPath(path);
        }

        // this.responseContentType = contentType;

        this.responseHeaders = {
            'Content-Type': this.responseContentType = contentType
        };
    }
}

class AssetResponse extends BaseResponse {
    constructor() {
        super();
    }
}

// TODO should do directive work
class ControllerResponse extends BaseResponse {
    constructor() {
        super();
    }
}

// TODO should call super for directive work
class ControllerTemplateResponse extends ControllerResponse {
    constructor() {
        super();
    }
}

// TODO should call super for directive work
class ControllerTemplatePathResponse extends ControllerResponse {
    constructor() {
        super();
    }
}

class UnknownResponse extends BaseResponse {
    constructor() {

    }
}

class ErrorResponse extends BaseResponse {
    constructor() {
        super();
    }
    head() {

        // TODO where is the response
        this.response.writeHead(
            500,
            RESPONSE_HEADER_MESSAGES[ '500' ],
            this.responseHeaders
        );
        return this;
    }
}

export default $Response;
export {
    AssetResponse,
    ControllerTemplateResponse,
    ControllerTemplatePathResponse
    UnknownResponse,
    ErrorResponse
};
