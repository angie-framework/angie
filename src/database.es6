'use strict';

import Config from './Config';
import MySqlConnection from './models/MySqlConnection';
import FirebaseConnection from './models/FirebaseConnection';
import SqliteConnection from './models/SqliteConnection';

let config;

export default class Database {
    constructor() {
        if (!config) {
            config = Config.fetch();
        }

        let db = config.databases;
        if (db && db.default && db.default.type) {
            let type = db.default.type;
            switch (type.toLowerCase()) {
                case 'mysql':
                    this.db = new MySqlConnection();
                    this.db.sync();
                case 'firebase':
                    this.db = new FirebaseConnection();
                    this.db.sync();
                default:
                    this.db = new SqliteConnection();
                    this.db.sync();
            }
        }
    }
}

// TODO Here we want to establish our first connection and set up shared methods
// TODO recurse through all dbs
