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
        templateDirs = config.templateDirs || [],
        cached = false,
        template;

    if (url.charAt(0) !== '/') {
        url = `/${url}`;
    }

    templateDirs.unshift(ANGIE_TEMPLATE_DIR);

    templateDirs.forEach(function(v) {
        let tmp;

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
            tmp = fs.readFileSync(`${v}${url}`, 'utf8');
            if (tmp) {
                template = tmp;
            }
        } catch(e) {} // Moot error, I know you've probably got may static dirs
    });

    if (!template) {

        // TODO when you are rendering dynamic templates, pass the static urls
        // to this path

        return false;
    } else {
        $templateCache.put(url, template);
        return template;
    }
}

let $templateCache = new $TemplateCache();
export {$templateCache, $templateLoader};
