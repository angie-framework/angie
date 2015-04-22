'use strict'

const fs =      require('fs'),
    chalk =     require('chalk');

let config = undefined;

export default class Config {
    constructor() {
        console.log(chalk.bold(chalk.green('Build Config')));
        if (!config) {
            console.log(chalk.bold(chalk.green('Read Settings File:')));
            try {
                config = JSON.parse(fs.readFileSync('AngieFile.json', 'utf8'));
                console.log(config);
            } catch(e) {
                console.log(chalk.bold(chalk.red(e)));

                // TODO remove this:
                config = JSON.parse(fs.readFileSync('bin/_AngieFile.json', 'utf8'));
                
                // TODO re-add this:
                // process.exit(1);
            }
        }
    }
    static fetch() {
        return config;
    }
}
