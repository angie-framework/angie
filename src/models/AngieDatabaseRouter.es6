'use strict'; 'use strong';

import {config} from '../Config';
import $cacheFactory from '../services/$cacheFactory';
import $ExceptionsProvider from '../util/$ExceptionsProvider';
import SqliteConnection from './SqliteConnection';
import MySqlConnection from './MySqlConnection';

export default function AngieDatabaseRouter(args) {
    let databases = new $cacheFactory('databases'),
        database;

    if (!config) {
        $ExceptionsProvider.$$configError();
    }

    let name = 'default';
    if (typeof args === 'object' && args.length) {
        args.forEach(function(arg) {
            if (Object.keys(config.databases || {}).indexOf(args[2]) > -1) {
                name = arg;
            }
        });
    } else if (typeof args === 'string') {
        name = args;
    }

    // Check to see if the database is in memory
    database = databases.get(name);
    if (database) {
        return database;
    }

    let db = config.databases ? config.databases[name] : undefined,
        destructive = process.argv.indexOf('--destructive') > -1;

    if (db && db.type) {
        let type = db.type;

        // TODO call these with the actual DB, we should not have to check
        // the config once it's in a bucket

        switch (type.toLowerCase()) {
            case 'mysql':
                database = new MySqlConnection(name, db, destructive);
                break;
            case 'firebase':
                database = new FirebaseConnection(db, destructive);
                break;
            default:
                database = new SqliteConnection(db, destructive);
        }
    }
    if (!database) {
        $ExceptionsProvider.$$invalidDatabaseConfig();
    }

    // Setup a cache of database connections in memory already
    databases.put(name, database);
    return database;
}
