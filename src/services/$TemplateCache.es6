'use strict';

import Config from '../Config';
import {$cacheFactory} from './$CacheFactory';

const fs =      require('fs');

class $TemplateCache extends $cacheFactory {
    constructor() {
        super('templateCache');
    }
}

function $templateLoader(url) {
    let config = Config.fetch(),
        staticDirs = config.staticDirs,
        template,
        cached = false

    staticDirs.unshift('');

    staticDirs.forEach(function(v) {
        let tmp = $templateCache.get(`${v}/url`);
        if (tmp) {
            template = tmp;
            cached = true;
        }
    });

    if (!template) {
        staticDirs.forEach(function(v) {
            let tmp;
            try {
                tmp = fs.readFileSync(`${v}/url`, 'utf8');
                if (tmp) {
                    template = tmp;
                }
            } catch(e) {}
        });
    }

    if (!template) {
        // TODO 404
    } else {
        if (!cached) {
            $templateCache.put(url, template);
        }
        return template;
    }
}

let $templateCache = new $TemplateCache();

export {$templateCache, $templateLoader};

// TODO template load from staticDirs;
