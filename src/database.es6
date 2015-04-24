'use strict';

import Config from './config';
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

            // Do a mook check to see if the database connection is viable
            switch (type) {
                default:
                    this.db = new SqliteConnection();
                    this.db.sync();
            }
        }
    }
}

// TODO Here we want to establish our first connection and set up shared methods
