'use strict';

import Config from '../../config';

const p =       process,
    chalk =     require('chalk'),
    exec =      require('child_process').exec,
    mkdirp =    require('mkdirp'),
    fs =        require('fs');

export default function createInstance(n) {

    // TODO write instances to config
    return exec(`find ${p.cwd()} -type f -name "AngieFile.json"`, function(err, stdout) {
        if (!err) {
            let dir = `${p.cwd()}/${n}`;
            mkdirp.sync(dir);
            fs.writeFileSync(`${dir}/models.js`, '// Create models here', 'utf8');
            fs.writeFileSync(`${dir}/views.js`, '// Create views here', 'utf8');

            let config = Config.fetch();

            console.log(config);
            config.instances.push(n);
        }
    });
}

// TODO you can't make an app in the settings folder
