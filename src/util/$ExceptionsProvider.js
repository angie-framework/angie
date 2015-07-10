'use strict'; 'use strong';

// System Modules
import {bold, red, blue} from    'chalk';

const bread = () => red(bold.apply(null, arguments));

// TODO use native node exception types where possible
class $$InvalidConfigError extends Error {
    constructor() {
        super(bread(
            'Invalid application configuration. Check your ' +
            blue('Angiefile.json')
        ));
    }
}

class $$InvalidDirectiveConfigError extends Error {
    constructor(name) {
        super(bread(`Invalid configuration for directive ${name}`));
    }
}

class $$ProjectCreationError extends Error {}

class $$ProviderNotFoundError extends Error {
    constructor(name) {
        super(bread(`Cannot find ${name} <-- ${name}Provider`));
    }
}

export {
    $$InvalidConfigError,
    $$InvalidDirectiveConfigError,
    $$ProjectCreationError,
    $$ProviderNotFoundError
};
