'use strict'; 'use strong';

import {config} from '../Config';

const chalk =       require('chalk');

class $Exceptions {
    constructor() {}
    $$databaseConnectivityError(database) {
        let message;
        switch (database.type) {
            case 'mysql':
                message = `Could not find MySql database ${database.name || database.alias}@` +
                    `${database.host || '127.0.0.1'}:${database.port || 3306}`;
                break;
            default:
                message = `Could not find ${database.name} in filesystem.`;
        }
        throw new Error(err(message));
    }
    $$databaseTableExists(e) {
        throw new Error(err(e));
    }
    $$invalidConfig(type = '') {
        throw new Error(
            err(`Invalid ${type} configuration settings. Please check your AngieFile.`)
        );
    }
    $$invalidDatabaseConfig() {
        return this.$$invalidConfig('database');
    }
    $$invalidModelConfig(name) {
        throw new Error(
            err(`Invalid Model configuration for model ${name} <-- ${name}Provider`)
        );
    }
    $$invalidModelFieldReference(name = '', field) {
        throw new Error(
            err(`Invalid param for Model ${name}@${field}`)
        );
    }
    $$invalidModelReference() {
        throw new Error(
            err(`Invalid Model argument`)
        )
    }
}

function err() {
    return chalk.red(chalk.bold.apply(null, arguments));
}

const $ExceptionsProvider = new $Exceptions();
export default $ExceptionsProvider;
