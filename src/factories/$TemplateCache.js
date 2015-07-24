'use strict'; 'use strong';

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

// TODO this is really more of a directive functionality
// TODO make this work with .css, .less, .scss, .haml
// TODO move this to $resource
// TODO auto load angular, jquery, underscore, etc.
function $resourceLoader() {
    const $response = $Injector.get('$response');

    if (!$response) {
        return false;
    }

    // TODO accepts a string or an array
    // Options for loading files are:
    // Inline: loads the script into script tags
    // Script: attaches the url to the response resource
    let files = arguments[0];

    const loadStyle = arguments[1] || 'src';

    if (typeof files === 'string') {
        files = [ files ];
    }

    files.forEach(function(resource) {

        // Return if not a js file
        if (resource.split('.').pop() !== 'js') {
            return;
        }

        // TODO put this into a template?
        let asset = '<script type=\'text/javascript\'';
        if (loadStyle === 'src') {
            asset += ` src='${resource}'>`;
        } else {
            let assetCache = new $CacheFactory('staticAssets'),
                assetPath = resource.split('/').pop(),
                staticAsset;

            asset += '>';
            if (assetCache.get(assetPath)) {
                staticAsset = assetCache.get(assetPath);
            } else {
                staticAsset = $$templateLoader(assetPath, 'static');
            }

            if (staticAsset.length) {
                asset += `\n${staticAsset}`;
            }
        }

        asset += '</script>';

        let index = $response.$responseContent.indexOf('</body>');
        if (index > -1) {
            $response.$responseContent.splice(index, 0, asset);
        } else {
            $response.$responseContent = $response.$responseContent + asset;
        }
    });
}

const $templateCache = new $TemplateCache();
export {$templateCache, $$templateLoader, $resourceLoader};
