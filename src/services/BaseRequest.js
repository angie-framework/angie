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


// TODO does this all belong in the $Request file?

// TODO this will be done with the RESTful work
// class ControllerViewRequest extends ControllerRequest {
//     constructor() {
//
//     }
// }

// TODO this should contain methods specific to providing content, type, headers, etc