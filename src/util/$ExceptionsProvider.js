'use strict'; 'use strong';

import chalk from 'chalk';

// TODO use native node exception types where possible
class $ExceptionsProvider {
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
    static $$providerError() {

        // TODO should result in a 500
        let arg = Array.prototype.splice.call(arguments).join(', ');
        throw new Error(
            $$err(`Cannot find ${arg} <-- ${arg}Provider`)
        );
    }
}

// TODO this is how all of the errors should work, and should just call super
export class $$ProjectCreationError extends Error {}

function $$err() {
    return chalk.red(chalk.bold.apply(null, arguments));
}

export default $ExceptionsProvider;