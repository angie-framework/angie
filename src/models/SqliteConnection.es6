'use strict';

import BaseDBConnection from './BaseDBConnection';
import app from '../Angular';
import $log from '../util/$LogProvider';

const sqlite3 =       require('sqlite3').verbose(),
      fs =            require('fs');

export default class SqliteConnection extends BaseDBConnection {
    constructor(database = 'default') {
        super();

        // TODO this should not be necessary, this module should not be loaded
        // unless you've already proven to have a sqlite config
        if (checkConfig(this.config.databases[database])) {
            throw new Error();
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
                // });
            //}
        }
    }
    connect() {

    }
    sync(database = 'default') {
        let filename = this.config.databases[database].name;
        if (checkConfig(this.config.databases[database]) || !filename) {
            $log.error('Invalid DB configuration');
        } else if (!/\.db/.test(filename)) {
            $log.error('Invalid filename');
        }

        super.sync();

        // let dir = filename.split('/').length ? filename.split('/').pop().join('/') : null,
        //     file = filename.split('/').length ? filename.split('/').pop() : filename;
        // if (dir) {
        //     mkdirp.sync(dir);
        // }

        // TODO right now this must be a byproduct of an existing directory
        if (!fs.existsSync(filename)) {
            fs.closeSync(fs.openSync(filename, 'w'));
        }

        // There shouldn't be this.db at this point
        if (!this.db) {
            this.db = new sqlite3.Database(filename);
        }

        let db = this.db;

        // TODO don't serialize each time
        this.db.serialize(function() {
            this.models.forEach(function(v) {

                // Collect models from angular app
                let modelInstance = new app.Models[v]();
                db.run(`CREATE TABLE ${name(filename, modelInstance)}`);

                // Reads model classes and finds their fields
            });
        });
    }

    // TODO this is unecessary, but this should be a shorthand regardless
    // static serialize(db, fn) {
    //     return db.serialize(fn);
    // }

}

function checkConfig(db) {
    return !db || !db.default || !db.type || db.type !== 'sqlite3';
}
function name(filename, modelInstance) {
    return modelInstance.name || filename;
}

// TODO configure sync to work recursively
// TODO how do we get the models into the registrar?
// TODO prevent model duplicates?
// TODO prevent models from installing outside of instances?
// TODO migrate
