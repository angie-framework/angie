/**
 * @module BaseRequest.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
import $LogProvider from                        'angie-log';
import {$injectionBinder} from                  'angie-injector';

// Angie Modules
import app from                                 '../Angie';
import {config} from                            '../Config';
import {
    $templateCache,
    $$templateLoader,
    $resourceLoader
} from                                          '../factories/$TemplateCache';
import $compile from                            '../factories/$Compile';
import {default as $MimeType} from              '../util/$MimeTypeProvider';

import $Util, {
    $StringUtil
} from                                          '../util/Util';


class BaseRequest {
    constructor() {

    }
}

class AssetRequest {
    constructor() {

    }
}

class ControllerRequest {
    constructor() {

    }
}

class ControllerTemplateRequest extends ControllerRequest {
    constructor() {

    }
}

class ControllerTemplatePathRequest extends ControllerRequest {
    constructor() {

    }
}

class UnknownRequest {
    constructor() {

    }
}

class ErrorRequest {
    constructor() {

    }
}

// TODO does this all belong in the $Request file?

// TODO this will be done with the RESTful work
// class ControllerViewRequest extends ControllerRequest {
//     constructor() {
//
//     }
// }

// TODO this should contain methods specific to providing content, type, headers, etc