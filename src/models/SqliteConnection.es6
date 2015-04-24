'use strict'

import BaseDBConnection from './BaseDBConnection';
import app from '../Angular';

const chalk =       require('chalk'),
    sqlite3 =       require('sqlite3').verbose(),
    mkdirp =        require('mkdirp'),
    fs =            require('fs');

export default class SqliteConnection extends BaseDBConnection {
    constructor() {
        super();

        // TODO this should not be necessary, this module should not be loaded
        // unless you've already proven to have a sqlite config
        if (this.checkConfig()) {
            console.log(chalk.bold(chalk.red('ANGIE [Error]: wut?')));
        } else if (!this.db) {
            //try {
            //    this.db = new sqlite3.Database(`:${this.config.databases.default.name}:`);
            //} catch(e) {
            //    throw new Error(`ANGIE [Error]: ${e}`);
            //} //finally {

                // TODO find a way to commonize the serialization
                // this.db.serialize(function() {
                //
                //     //this.db.run('CREATE TABLE lorem');
                //     console.log(chalk.bold(chalk.green('ANGIE [Log]: Connected')));
                // });
            //}
        }
    }
    connect() {

    }
    sync() {
        console.log('sync');
        console.log(this.config.databases.default.name);
        if (this.checkConfig() || !this.config.databases.default.name) {
            console.log(chalk.bold(chalk.red('ANGIE [Error]: wut?')));
        }
        let filename = this.config.databases.default.name,
            hasDir = filename.indexOf('/') > -1,
            dir =  hasDir ? filename.split('/').pop().join('/') : null,
            file = hasDir ? filename.split('/').pop() : file;

        super.sync();
        console.log(dir, file);

        try {
            if (dir) {
                mkdirp.sync(dir);
            }
            fs.writeFileSync(file, '', 'utf8');
        } catch(e) {
            console.log(e);
        }

        // Collect models from angular app
        console.log(app);

        // Reads model classes and finds their fields
    }

    // TODO this is unecessary, but this should be a shorthand regardless
    // static serialize(db, fn) {
    //     return db.serialize(fn);
    // }
    checkConfig() {
        return !this.config.databases || !this.config.databases.default ||
            !this.config.databases.default.type ||
            this.config.databases.default.type !== 'sqlite3';
    }
}

// TODO configure sync to work recursively
