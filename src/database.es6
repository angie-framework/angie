'use strict';

import Config from './config';

let config = Config.fetch();

export default class Database {
    contructor() {
        let db = settings.database;
        if (db && db.default && db.default.type) {
            // Do a mook check to see if the database connection is viable
        }
    }
}

// TODO Here we want to establish our first connection and set up shared methods
