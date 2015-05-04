'use strict'

import BaseDBConnection from './BaseDBConnection';
import $log from '../util/$LogProvider';
import app from '../Angular';

const chalk =           require('chalk'),
      mysql =           require('mysql');
      // mkdirp =          require('mkdirp'),
      // fs =              require('fs');

const p = process,
      DEFAULT_HOST = '127.0.0.1';

export default class MySqlConnection extends BaseDBConnection {
    constructor(database = 'default') {
        super();

        // TODO this should not be necessary, this module should not be loaded
        // unless you've already proven to have a sqlite config
        if (checkConfig(this.config.databases[database])) {
            $log.error('wat?');
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
            me.connection.on('error', function(e) {
                $log.error(e);
                if (me.db.options.hardErrors) {
                    p.exit(1);
                }
            });
        }
    }
    connect() {
        let me = this;
        me.connection.connect(function(e) {
            if (e) {
                $log.error(e);
                process.exit(1);
            }
            $log.info('Connection successful');
            me.disconnect();
        });
    }
    disconnect() {
        this.connection.end();
    }
    query(q) {
        let me = this;
        return new Promise(function(resolve, reject) {
            me.connection.query(q, function(e, r, f) {

                if (e) {
                    $log.error(e);
                    reject(e);
                } else {
                    resolve({
                        data: r//,
                        //fields: fields
                    });
                }
            });
        }).then(function(d) {
            // me.disconnect(function() {
            //     return d;
            // });
            return d;
        }, function(e) {
            $log.error(e);
            if (me.db.options.hardErrors) {
                p.exit(1);
            }
            return false;
        });
    }
    sync(database = 'default') {
        let me = this;

        if (checkConfig(me.config.databases[database])) {
            $log.error('Invalid database configuration');
            p.exit(1);
        }

        super.sync();

        // let tmpConnection = mysql.createConnection({
        //         host: this.db.__resolvedHost__,
        //         user: this.db.username || '',
        //         password: this.db.password || '',
        //         database: ''
        //     });


        //tmpConnection.connect().query(
        //    `CREATE SCHEMA ${this.db.name};`,
            // function(e, r) {
            //     if (e) {
            //         process.exit(1);
            //me.connect();
                //var proms = [];
        this.connect();
                // me.models.forEach(function(v) {
                //     let modelInstance = new app.Models[v],
                //         tableName = modelInstance.name || v;
                //     //proms.push(
                //         me.query(
                //             `CREATE TABLE \`${me.db.name}\`.\`${tableName}\`` +
                //             ' (`id` int(11) NOT NULL AUTO_INCREMENT, ' +
                //             'PRIMARY KEY (`id`) ' +
                //             ') ENGINE=InnoDB DEFAULT CHARSET=latin1;'
                //         );
                //     //);
                // });
                // Promise.all(proms).then(function() {
                //     process.exit(1);
                // });
                //me.disconnect();
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
