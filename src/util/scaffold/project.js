'use strict'; 'use strong';

import $log from '../$LogProvider';

import fs from 'fs';
import util from 'util';

const p = process;

export default function createProject(args) {
    const name = args.name;

    if (!name) {
        $log.error('No project name specified');
        p.exit(1);
    } else if (!/([A-z]+)/.test(name)) {
        $log.error('Invalid project name: must be all letters');
        p.exit(1);
    }

    let file = name.indexOf('/') < 0 ? name.split('/') : name,
        dirname = file.length > 1 ? file.splice(-1).join('/') : '',
        makeDir = `${p.cwd()}/${dirname}${dirname.length ? '/' : ''}${name}`,
        makeSub = `${makeDir}/src`;

    try {
        fs.mkdirSync(makeDir);
        fs.mkdirSync(makeSub);

        [
            'constants',
            'configs',
            'services',
            'controllers',
            'models',
            'directives'
        ].forEach(function(v) {
            fs.mkdirSync(`${makeSub}/${v}`);
        });
        [
            'static',
            'templates'
        ].forEach(function(v) {
            fs.mkdirSync(`${makeDir}/${v}`);
        });
    } catch(e) {
        $log.error('Project directory already exists');
        p.exit(1);
    } finally {
        let template = fs.readFileSync(
            `${__dirname}/../../templates/AngieFile.template.json`,
            'utf8'
        );
        template = util.format(template, name, name);
        fs.writeFileSync(
            `${makeDir}/AngieFile.json`,
            template,
            'utf8'
        );
    }

    $log.info('Project successfully created');
    p.exit(0);
}

// TODO create with . for settings in the same directory
