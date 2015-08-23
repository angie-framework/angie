/**
 * @module $TemplateCache.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
import fs from                      'fs';
import {default as $Injector} from  'angie-injector';

// Angie Modules
import {config} from                '../Config';
import $CacheFactory from           './$CacheFactory';
import {
    $StringUtil,
    $FileUtil
} from                              '../util/Util';

const p = process,
      ANGIE_TEMPLATE_DIRS = [
          `${__dirname}/../templates/html`,
          `${__dirname}/../../test/src/templates`
      ],
      ANGIE_STATIC_DIRS = [];

class $TemplateCache extends $CacheFactory {
    constructor() {
        super('templateCache');
    }
    get(url) {
        let template = super.get(url);
        if (!template) {
            template = $$templateLoader(url);
        }
        if (template && config.cacheStaticAssets) {
            this.put(url, template);
        }
        return template;
    }
}

function $$templateLoader(url, type = 'template', encoding) {

    // Clone them template dirs
    let templateDirs = (
        config[ `${type}Dirs` ].slice() || []
    ),
    template;

    // Add the default Angie template dirs to the existing config template dirs
    templateDirs = templateDirs.concat(
        type === 'template' ? ANGIE_TEMPLATE_DIRS :
            type === 'static' ? ANGIE_STATIC_DIRS : []
    );

    templateDirs = templateDirs.map(function(dir) {
        if (
            (
                (type === 'template' && ANGIE_TEMPLATE_DIRS.indexOf(dir) === -1) ||
                (type === 'static' && ANGIE_STATIC_DIRS.indexOf(dir) === -1)
            ) &&
            dir.indexOf(p.cwd()) === -1
        ) {
            dir = $StringUtil.removeLeadingSlashes(dir);
            dir = `${p.cwd()}/${dir}`;
        }
        dir = $StringUtil.removeTrailingSlashes(dir);
        return dir;
    });

    // Deliberately use a for loop so that we can break out of it
    for (var i = templateDirs.length - 1; i >= 0; --i) {
        let dir = templateDirs[i],
            path = $FileUtil.find(dir, url);

        if (typeof path === 'string') {
            template = fs.readFileSync(path, encoding || undefined);
        }

        if (template) {
            break;
        }
    }

    if (!template) {
        return false;
    } else if (
        type === 'static' &&
        config.hasOwnProperty('cacheStaticAssets') &&
        config.cacheStaticAssets === true
    ) {
        // TODO you may want to put this in the asset loading block
        new $CacheFactory('staticAssets').put(url, template);
    }
    return template;
}

/**
 * @desc $resourceLoader is a factory that will attach a JavaScript resource
 * to any respose. It will attach it inside of the body if the file is requested
 * to be attached on an HTML response.
 * @since 0.3.2
 * @todo Make this work with .css, .less, .scss, .haml
 * @todo Auto load Angular, jQuery, Underscore, etc. from their names alone
 * via Bower installs. Must create bower.json & bump bower version.
 * @param {string|Array} [param=10] filename Valid JS filename in Angie static
 * directories
 * @param {string} [param='src'] loadStyle How is this resource attached to the
 * document. Options:
 *     'src':       Include a script tag with the name of the resource
 *     'inline':    Include the resource content inline
 * @returns {boolean} Whether this function successfully finished (not an
 * indication that the resource was actually attached)
 * @access public
 * @example $resourceLoader('test.js');
 */
function $resourceLoader(files = [], loadStyle = 'src') {
    console.log('IN RESOURCE LOADER', files);
    let [ $request, $response ] = $Injector.get('$request', '$response');
    console.log('RESPONSE', $response);
    if (!$response || typeof $response !== 'object') {
        return false;
    } else if (!$response.$responseContent) {

        // Just in case the response property was not already defined
        $response.$responseContent = '';
    }

    if (typeof files === 'string') {
        files = [ files ];
    }

    files.forEach(function(resource) {

        // Return if not a js file
        if (resource.split('.').pop() !== 'js') {
            return;
        }

        console.log('IN RESOURCE LOADER', resource);


        // TODO put this into a template?
        let asset = '<script type="text/javascript"';
        if (loadStyle === 'src') {
            asset += ` src="${[
                $StringUtil.removeTrailingSlashes($request.path)
                    .replace(/([A-Za-z]+)/g, '..'),
                resource
            ].join('/')}">`;
        } else {
            let assetCache = new $CacheFactory('staticAssets'),
                assetPath = resource.split('/').pop(),
                staticAsset;

            asset += '>';
            if (assetCache.get(assetPath)) {
                staticAsset = assetCache.get(assetPath);
            } else {
                staticAsset = $$templateLoader(assetPath, 'static', 'utf8');
            }

            if (staticAsset.length) {
                asset += `${staticAsset}`;
            }
        }

        asset += '</script>';

        console.log('ASSET', asset);

        const BODY = '</body>',
            STR = $response.$responseContent;
        if (STR.indexOf(BODY) > -1) {
            let body = STR.lastIndexOf(BODY);

            console.log('IN BODY');

            $response.$responseContent =
                `${STR.substr(0, body)}${asset}${STR.substr(body)}`;
        } else {
            $response.$responseContent = $response.$responseContent + asset;
        }
        console.log('content', $response.$responseContent);
    });
    return true;
}

const $templateCache = new $TemplateCache();
export {
    $templateCache,
    $$templateLoader,
    $resourceLoader
};
