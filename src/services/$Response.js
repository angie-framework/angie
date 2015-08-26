/**
 * @module $Responses.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
import {default as $Injector} from  'angie-injector';

// Angie Modules
import {config} from                './Config';
// import app from '../Angie';
import $CacheFactory from           './factories/$CacheFactory';
import {
    $templateCache,
    $$templateLoader,
    $resourceLoader
} from                              '../factories/$TemplateCache';
import {default as $MimeType} from  '../util/$MimeTypeProvider';
import $Util, {$StringUtil} from    '../util/Util';

class $Response {
    constructor(response) {

        // Define $Response based instance of createServer.prototype.response
        this.response = response;

        // Define the Angie $responseContent string
        this.response.$responseContent = '';
        //app.service('$response', this.response);
    }
}

const [
    RESPONSE_HEADER_MESSAGES,
    PRAGMA_HEADER,
    NO_CACHE_HEADER
] = $Injector.get('RESPONSE_HEADER_MESSAGES');

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

        // Set the content type based on the asset path
        const path = this.path = $Injector.get('$request').path;
        this.responseHeaders[ 'Content-Type' ] = $MimeType.fromPath(path);
    }
    head() {

        // TODO this should be a config option at the response level
        // Check to see if we should cache this response
        // if (
        //     config.hasOwnProperty('cacheStaticAssets') &&
        //     !config.cacheStaticAssets
        // ) {

        $Util._extend(
            this.responseHeaders,
            {
                Expires: -1,
                Pragma: PRAGMA_HEADER,
                'Cache-Control': NO_CACHE_HEADER
            }
        );

        this.response.writeHead(
            200,
            RESPONSE_HEADER_MESSAGES[ '200' ],
            this.responseHeaders
        );
    }
    write() {
        let assetCache = new $CacheFactory('staticAssets'),
            asset = assetCache.get(path) || $$templateLoader(path, 'static') || '';

        if (
            config.hasOwnProperty('cacheStaticAssets') &&
            !config.cacheStaticAssets
        ) {
            assetCache.put(this.path, asset);
        }

        response.write(asset);
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
        super();
        this.html = $$templateLoader('404.html');
    }
    head() {
        this.response.writeHead(
            404,
            app.constants.RESPONSE_HEADER_MESSAGES['404'],
            this.responseHeaders
        );
    }
    write() {
        this.response.write(this.html);
    }
}

class ErrorResponse extends BaseResponse {
    constructor() {
        super();
        this.html = `<h1>${RESPONSE_HEADER_MESSAGES[ '500' ]}</h1>`;
    }
    head() {
        this.response.writeHead(
            500,
            RESPONSE_HEADER_MESSAGES[ '500' ],
            this.responseHeaders
        );
        return this;
    }
    write() {
        this.response.write(this.html);
    }
}

// TODO this will be done with the RESTful work
// class ControllerViewRequest extends ControllerRequest {
//     constructor() {
//
//     }
// }

export default $Response;
export {
    AssetResponse,
    ControllerTemplateResponse,
    ControllerTemplatePathResponse,
    UnknownResponse,
    ErrorResponse
};
