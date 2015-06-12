'use strict'; 'use strong';

import BaseDBConnection from './BaseDBConnection';
import $log from '../util/$LogProvider';
import $ExceptionsProvider from '../util/$ExceptionsProvider';

const mysql =           require('mysql');

const p = process,
      DEFAULT_HOST = '127.0.0.1',
      DEFAULT_PORT = 3306;

export default class MySqlConnection extends BaseDBConnection {
    constructor(name, database, destructive) {
        super(database, destructive);

        let db = this.database;

        if (!db.username) {
            $ExceptionsProvider.$$invalidDatabaseConfig();
        } else if (!this.connection) {
            this.connection = mysql.createConnection({
                host: db.host || DEFAULT_HOST,
                port: db.port || DEFAULT_PORT,
                user: db.username || '',
                password: db.password || '',
                database: name || db.name || db.alias
            });

            this.connection.on('error', function() {
                $ExceptionsProvider.$$databaseConnectivityError(db);
                if (db.options && db.options.hardErrors) {
                    p.exit(1);
                }
            });
        }
    }
    types(field) {
        let type = field.type;
        if (!type) {
            return;
        }
        switch (type) {
            case 'CharField':
                return 'VARCHAR';

            // TODO support different size integers: TINY, SMALL, MEDIUM
            case 'IntegerField':
                return 'INTEGER';
            case 'ForeignKeyField':
                return `INTEGER, ADD CONSTRAINT FOREIGN KEY(${field.fieldname}) ` +
                    `REFERENCES ${field.rel}(id) ON DELETE CASCADE`;
            default:
                return undefined;
        }
    }
    connect() {
        let me = this;
        return new Promise(function() {
            me.connection.connect(arguments[0]);
        }).then(
            () => $log.info('Connection successful'),
            () =>
                $ExceptionsProvider.$$databaseConnectivityError(me.database)
        );
    }
    disconnect() {
        return this.connection.end();
    }
    run(query, model) {
        let me = this,
            db = this.database,
            name = db.name || db.alias;
        return new Promise(function() {
            try {
                return me.connect().then(arguments[0]);
            } catch(e) {}
        }).then(function() {
            return new Promise(function(resolve) {
                $log.info(
                    `MySql Query: ${name}: ${query}`
                );
                return me.connection.query(query, function(e, rows = []) {
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
    all() {
        const query = super.all.apply(this, arguments);
        return this.run(query, arguments[0].model);
    }
    create() {
        const query = super.create.apply(this, arguments);
        return this.run(query, arguments[0].model);
    }
    delete() {
        const query = super.delete.apply(this, arguments);
        return this.run(query, arguments[0].model);
    }
    update() {
        const query = super.update.apply(this, arguments);
        return this.run(query, arguments[0].model);
    }
    raw(query, model) {
        return this.run(query, model);
    }
    sync() {
        let me = this;

        // Don't worry about the error state, handled by connection
        return super.sync().then(() => me.connect().then(arguments[0]))
            .then(function() {

                let models = me.models(),
                    proms = [];

                for (let model in models) {

                    // Fetch models and get model name
                    let instance = models[ model ],
                        modelName = instance.name || instance.alias ||
                            me.name(model);

                    // Run a table creation with an ID for each table
                    proms.push(me.run(
                        `CREATE TABLE \`${modelName}\`` +
                        ' (`id` int(11) NOT NULL AUTO_INCREMENT, ' +
                        'PRIMARY KEY (`id`) ' +
                        ') ENGINE=InnoDB DEFAULT CHARSET=latin1;'
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

        return super.migrate().then(() => me.connect().then(arguments[0]))
            .then(function() {
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
                            `ALTER TABLE \`${modelName}\` ADD \`${field}\` ` +
                            `${me.types(instance[ field ])}` +
                            (
                                instance[ field ].maxLength ?
                                `(${instance[ field ].maxLength})` : ''
                            ) +
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
