'use strict';

const p =       process,
    chalk =     require('chalk'),
    mkdirp =    require('mkdirp'),
    fs =        require('fs'),
    util =      require('util');

export default function createProject(args) {
    let name = args.name;

    if (!name) {
        console.log(
            chalk.bold(
                chalk.red('ANGIE [Error]: No Project Name Specified.')
            )
        );
        p.exit(1);
    } else if (!/([A-z]+)/.test(name)) {
        console.log(
            chalk.bold(
                chalk.red('ANGIE [Error]: Invalid Project name: must be all letters.')
            )
        );
        p.exit(1);
    }

    let file = name.indexOf('/') < 0 ? name.split('/') : name,
        dirname = file.length > 1 ? file.splice(-1).join('/') : '';

    name = file.length ? file.pop() : file,

    makeDir = `${p.cwd()}/${dirname}${dirname.length ? '/' : ''}${name}`,
    makeSub = `${makeDir}/src`;

    try {
        fs.mkdirSync(makeDir);
        fs.mkdirSync(makeSub);
        [ 'controllers', 'models', 'directives', 'static' ].forEach(function(v) {
            fs.mkdirSync(`${makeSub}/${v}`);
        })
    } catch(e) {
        console.log(
            chalk.bold(
                chalk.red('ANGIE [Error]: Project directory already exists.')
            )
        );

        p.exit(1);
    } finally {
        let template = fs.readFileSync(
            `${__dirname}/../../templates/AngieFile.sample.json`,
            'utf8'
        );
        template = util.format(template, name);
        fs.writeFileSync(
            `${makeSub}/AngieFile.json`,
            template,
            'utf8'
        );
    }

    process.exit(0);
}

// TODO create with . for settings in the same directory
// TODO do we need instances?
