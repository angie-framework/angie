'use strict'; 'use strong';

import chalk from 'chalk';

// TODO use native node exception types where possible
class $ExceptionsProvider {
    static $$databaseConnectivityError(database) {
        let message;
        switch (database.type) {
            case 'mysql':
                message = `Could not find MySql database ${database.name || database.alias}@` +
                    `${database.host || '127.0.0.1'}:${database.port || 3306}`;
                break;
            default:
                message = `Could not find ${database.name} in filesystem.`;
        }
        throw new Error($$err(message));
    }
    static $$databaseTableExists(e) {
        throw new Error($$err(e));
    }
    static $$injectorError() {
        throw new Error(
            $$err('Injector cannot be called without a provider name')
        );
    }
    static $$invalidConfig(type = '') {
        throw new Error(
            $$err(`Invalid ${type} configuration settings. Please check your AngieFile.`)
        );
    }
    static $$invalidDirectiveConfig(name = '') {
        throw new Error(
            $$err(`Invalid configuration for directive ${name}`)
        );
    }
    static $$invalidDatabaseConfig() {
        return this.$$invalidConfig('database');
    }
    static $$invalidModelConfig(name) {
        throw new Error(
            $$err(`Invalid Model configuration for model ${name} <-- ${name}Provider`)
        );
    }
    $$invalidModelFieldReference(name = '', field) {
        throw new Error(
            $$err(`Invalid param for Model ${name}@${field}`)
        );
    }
    static $$invalidModelReference() {
        throw new Error(
            $$err(`Invalid Model argument`)
        );
    }
    static $$providerError() {

        // TODO should result in a 500
        let arg = Array.prototype.splice.call(arguments).join(', ');
        throw new Error(
            $$err(`Cannot find ${arg} <-- ${arg}Provider`)
        );
    }
}

function $$err() {
    return chalk.red(chalk.bold.apply(null, arguments));
}

export default $ExceptionsProvider;