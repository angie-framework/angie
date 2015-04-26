'use strict'

import BaseDBConnection from './BaseDBConnection';
import app from '../Angular';

const chalk =           require('chalk'),
      mysql =           require('mysql'),
      mkdirp =          require('mkdirp'),
      fs =              require('fs');

const p = process,
      DEFAULT_HOST = '127.0.0.1';

export default class MySqlConnection extends BaseDBConnection {
    constructor(database = 'default') {
        super();

        // TODO this should not be necessary, this module should not be loaded
        // unless you've already proven to have a sqlite config
        if (checkConfig(this.config.databases[database])) {
            console.log(chalk.bold(chalk.red('ANGIE [Error]: wut?')));
            p.exit(1);
        } else if (!this.connection) {
            let me = this;
            me.db = me.config.databases[database];
            me.connection = mysql.createConnection({
                host: me.db.host || '127.0.0.1',
                port: me.db.port || 3306,
                user: me.db.username || '',
                password: me.db.password || '',
                database: me.db.name
            });
            me.angieQuery = function(q) {
                return new Promise(function(resolve, reject) {
                    console.log('r');
                    me.query(q, function(e, r, f) {
                        if (e) {
                            console.log(chalk.red(chalk.bold(`ANGIE: [Error] ${e}`)));
                            if (me.db.options.hardErrors) {
                                p.exit(1);
                            }
                            reject(e);
                        } else {
                            console.log('built table');
                            resolve({
                                data: r//,
                                //fields: fields
                            });
                        }
                    });
                });
            };
            me.connection.on('error', function(e) {
                console.log(chalk.red(chalk.bold(`ANGIE: [Error] ${e}`)));
                if (me.db.options.hardErrors) {
                    p.exit(1);
                }
            });
        }
    }
    connect() {
        this.connection.connect();
    }
    sync(database = 'default') {
        let me = this;

        if (checkConfig(me.config.databases[database])) {
            console.log(chalk.bold(chalk.red('ANGIE [Error]: Invalid DB configuration')));
        }

        super.sync();

        // let tmpConnection = mysql.createConnection({
        //         host: this.db.__resolvedHost__,
        //         user: this.db.username || '',
        //         password: this.db.password || '',
        //         database: ''
        //     });

        console.log('starting create');

        //tmpConnection.connect().query(
        //    `CREATE SCHEMA ${this.db.name};`,
            // function(e, r) {
            //     if (e) {
            //         console.log(e);
            //         process.exit(1);
            //     }
            //     console.log(this);
                me.connect();

                var proms = [];
                me.models.forEach(function(v) {
                    proms.push(me.angieQuery(`CREATE TABLE ${me.db.name}.${v};`));
                });
                Promise.all(proms);
            //}
        //);
    }
}

function checkConfig(db) {
    return !db || !db || !db.type || db.type !== 'mysql' || !db.name || !db.host;
}

// TODO configure sync to work recursively
// TODO how do we get the models into the registrar?
// TODO prevent model duplicates?
// TODO prevent models from installing outside of instances?
// TODO migrate
// TODO move check config into super
// TODO configure which db is hit using database param
