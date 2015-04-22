'use strict';

const p =       process,
    chalk =     require('chalk'),
    mkdirp =    require('mkdirp'),
    fs =        require('fs');

export default function createProject(n) {
    if (!n) {
        console.log(chalk.bold(chalk.red('ANGIE [Error]: No Project Name Specified.')));
        p.exit(1);
    }

    let file = n.split('/'),
        dirname = file.splice(-1).join('/'),
        name = file.pop();

    try {
        fs.mkdirSync([ dirname, name ].join('/'));
    } catch(e) {
        console.log(chalk.bold(chalk.red('ANGIE [Error]: Project directory already exists.')));
        p.exit(1)
    } finally {
        fs.writeFileSync([ p.cwd(), n, 'AngieFile.json'].join('/'), 'x', 'utf8');
    }

    process.exit(0);
}
