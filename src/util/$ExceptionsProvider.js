'use strict'; 'use strong';

// System Modules
import $LogProvider from    'angie-log';
import {cyan, blue} from    'chalk';

class $$InvalidConfigError extends Error {
    constructor() {
        $LogProvider.error(
            'Invalid application configuration. Check your ' +
            blue('Angiefile.json')
        );
        super();
    }
}

class $$InvalidComponentConfigError extends SyntaxError {
    constructor(type = 'directive', name) {
        $LogProvider.error(`Invalid configuration for ${type} ${cyan(name)}`);
        super();
    }
}

class $$InvalidServiceConfigError extends $$InvalidComponentConfigError {
    constructor(name) {
        super('service', name);
    }
}

class $$InvalidFactoryConfigError extends $$InvalidComponentConfigError {
    constructor(name) {
        super('factory', name);
    }
}

class $$InvalidDirectiveConfigError extends $$InvalidComponentConfigError {
    constructor(name) {
        super('directive', name);
    }
}

class $$ProjectCreationError extends Error {}

export {
    $$InvalidConfigError,
    $$InvalidServiceConfigError,
    $$InvalidFactoryConfigError,
    $$InvalidDirectiveConfigError,
    $$ProjectCreationError
};
