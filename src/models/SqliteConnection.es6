'use strict'; 'use strong';

import BaseDBConnection from './BaseDBConnection';
import $log from '../util/$LogProvider';
import $ExceptionsProvider from '../util/$ExceptionsProvider';

const sqlite3 =       require('sqlite3').verbose(),
      fs =            require('fs');

export default class SqliteConnection extends BaseDBConnection {
    constructor(database, destructive) {
        super(database, destructive);

        let db = this.database;
        if (!db.name) {
            $ExceptionsProvider.$$invalidDatabaseConfig();
        }
    }
    types(field) {
        let type = field.type;
        if (!type) {
            return;
        }
        switch (type) {
            case 'CharField':
                return 'TEXT';

            // TODO support different size integers: TINY, SMALL, MEDIUM
            case 'IntegerField':
                return 'INTEGER';
            case 'ForeignKeyField':
                return `INTEGER REFERENCES ${field.rel}(id)`;
            default:
                return undefined;
        }
    }
    connect() {
        let db = this.database;
        if (!this.connection) {
            try {
                this.connection = new sqlite3.Database(db.name);
                $log.info('Connection successful');
            } catch(err) {
                $ExceptionsProvider.$$databaseConnectivityError(db);
            }
        }
        return this.connection;
    }
    serialize(fn) {
        return this.connect().serialize(fn);
    }
    disconnect() {
        this.connect().close();
        return this;
    }
    query(query, model, key) {
        let me = this,
            db = this.database,
            name = db.name || db.alias;
        return new Promise(function(resolve) {
            $log.info(`Sqlite3 Query: ${name}: ${query}`);
            return me.serialize(resolve);
        }).then(function() {
            return new Promise(function(resolve) {
                me.connection[ key ](query, function(e, rows = []) {
                    if (e) {
                        $log.warn(e);
                    }
                    resolve([ rows, e ]);
                });
            });
        }).then(function(args) {
            return me.__querySet__(model, query, args[0], args[1]);
        });
    }
    run(query, model) {
        return this.query(query, model, 'run');
    }
    all() {
        const query = super.all.apply(this, arguments);
        return this.query(query, arguments[0].model, 'all');
    }
    create() {
        const query = super.create.apply(this, arguments);
        return this.query(query, arguments[0].model, 'all');
    }
    delete() {
        const query = super.delete.apply(this, arguments);
        return this.query(query, arguments[0].model,  'all');
    }
    update() {
        const query = super.update.apply(this, arguments);
        return this.query(query, arguments[0].model,  'all');
    }
    raw(query, model) {
        return this.query(query, model, 'all');
    }
    sync() {
        let me = this;
        super.sync().then(function() {
            let db = me.database,
                proms = [];

            // TODO test this in another directory
            if (!fs.existsSync(db.name)) {

                // Connection does not exist and we must touch the db file
                fs.closeSync(fs.openSync(db.name, 'w'));
            }

            let models = me.models();
            for (let model in models) {

                // Fetch models and get model name
                let instance = models[ model ],
                    modelName = instance.name || instance.alias ||
                        me.name(instance);

                // Run a table creation with an ID for each table
                proms.push(me.run(
                    `CREATE TABLE ${modelName} ` +
                        '(id INTEGER PRIMARY KEY AUTOINCREMENT);',
                    modelName
                ));
            }
            return Promise.all(proms).then(function() {
                return me.migrate();
            }).then(function() {
                return me.disconnect();
            });
        });
    }
    migrate() {
        let me = this;

        super.migrate().then(function() {
            let models = me.models(),
                proms = [];

            for (let model in models) {
                let instance = models[ model ],
                    modelName = instance.name || instance.alias ||
                        me.name(instance);
                instance.__fields__().forEach(function(field) {
                    let nullable = instance[ field ].nullable ? ' NOT NULL' : '',
                        unique = instance[ field ].unique ? ' UNIQUE' : '';
                    instance[ field ].fieldname = field;
                    proms.push(me.run(
                        `ALTER TABLE ${modelName} ADD COLUMN ${field} ` +
                            `${me.types(instance[ field ])}` +
                            `${instance[ field].type ===
                                'ForeignKeyField' ? nullable : ''}${unique};`
                    ));
                });
                if (me.destructive) {
                    console.log('destructive');
                }
            }
            return Promise.all(proms);
        });
    }
}

// TODO configure sync to work recursively
// TODO prevent model duplicates?
// TODO prevent models from installing outside of instances?
// TODO migrate
