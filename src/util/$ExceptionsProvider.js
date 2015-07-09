'use strict'; 'use strong';

// System Modules
import {bold, red, blue} from    'chalk';

const bread = (a) => bold(red(a));

// TODO use native node exception types where possible
export class $$InvalidConfigError extends Error {
    constructor(name) {
        super(bread(
            'Invalid application configuration. Check your ' +
            chalk.blue('Angiefile.json')
        ));
    }
}
export class $$InvalidDirectiveConfigError extends Error {
    constructor(name) {
        super(bread(`Invalid configuration for directive ${name}`));
    }
}
export class $$ProjectCreationError extends Error {}
export class $$ProviderNotFoundError extends Error {
    constructor(name) {
        super(bread(`Cannot find ${name} <-- ${name}Provider`));
    }
}
