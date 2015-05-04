'use strict';

import Config from '../Config';
import {$cacheFactory} from './$CacheFactory';
import $log from '../util/$LogProvider';

const fs =      require('fs');

const p = process,
      config = Config.fetch(),
      ANGIE_TEMPLATE_DIR = `${__dirname}/../templates/html`,

      // TODO do you want to replace this with another dir?
      ANGIE_STATIC_DIRS = [ `${__dirname}/../../site/css` ];

class $TemplateCache extends $cacheFactory {
    constructor() {
        super('templateCache');
    }
    get(url) {
        let template = super.get(url);
        if (!template) {
            template = $templateLoader(url);
        }
        this.put(url, template);
        return template;
    }
}

function $templateLoader(url, type = 'template') {
    let config = Config.fetch(),

        // Clone them template dirs
        templateDirs = (
            config[ `${type}Dirs` ].slice() || []
        ),
        cached = false,
        template;

    if (url.charAt(0) !== '/') {
        url = `/${url}`;
    }

    // Add the default Angie template dirs to the existing config template dirs
    if (type === 'template') {
        templateDirs.push(ANGIE_TEMPLATE_DIR);
    } else if (type === 'static') {
        templateDirs = templateDirs.concat(ANGIE_STATIC_DIRS);
    }

    // Returns the first matching template by name
    templateDirs.some(function(v) {
        if (v !== ANGIE_TEMPLATE_DIR && ANGIE_STATIC_DIRS.indexOf(v) === -1) {
            if (v.indexOf(p.cwd()) === -1) {
                if (v.charAt(0) !== '/') {
                    v = `${p.cwd()}/${v}`;
                } else {
                    v = `${p.cwd()}${v}`;
                }
                if (v.charAt(v.length - 1) === '/') {
                    v = v.slice(0, -1);
                }
            }
        }

        try {

            // TODO you could replace this with a deep find, but it would be slower
            template = fs.readFileSync(`${v}${url}`, 'utf8');
            return true;
        } catch(e) {
            return false;
        }
    });

    if (!template) {
        return false;
    } else if (type === 'template') {
        $templateCache.put(url, template);
    } else if (config.cacheStaticAssets !== true) {
        new $cacheFactory('staticAssets').put(url, template);
    }
    return template;
}

let $templateCache = new $TemplateCache();
export {$templateCache, $templateLoader};
