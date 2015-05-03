'use strict';

import Config from '../Config';
import {$cacheFactory} from './$CacheFactory';
import $log from '../util/$LogProvider';

const fs =      require('fs');

const p = process,
      ANGIE_TEMPLATE_DIR = `${__dirname}/../templates/html`;

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

function $templateLoader(url) {
    let config = Config.fetch(),

        // Clone them template dirs
        templateDirs = (
            config.templateDirs.slice() || []
        ),
        cached = false,
        template;

    if (url.charAt(0) !== '/') {
        url = `/${url}`;
    }

    // Add the default Angie template dirs to the existing config template dirs
    templateDirs.push(ANGIE_TEMPLATE_DIR);

    // TODO right now the behavior is that this returns the first template it
    // finds, is this correct?
    templateDirs.some(function(v) {
        if (v !== ANGIE_TEMPLATE_DIR) {
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
            template = fs.readFileSync(`${v}${url}`, 'utf8');
            return true;
        } catch(e) {
            return false;
        }
    });

    if (!template) {
        return false;
    } else {
        $templateCache.put(url, template);
        return template;
    }
}

let $templateCache = new $TemplateCache();
export {$templateCache, $templateLoader};
