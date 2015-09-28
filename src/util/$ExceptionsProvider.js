/**
 * @module $ExceptionsProvider.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 8/16/2015
 */

// System Modules
import {
    cyan,
    blue,
    bold,
    red
} from  'chalk';

class $$InvalidConfigError extends Error {
    constructor() {
        super(
            'Invalid application configuration. Check your ' +
            blue('Angiefile.json')
        );
    }
}

class $$InvalidModuleConfigError extends SyntaxError {
    constructor(type = 'directive', name) {
        super(bold(red(`Invalid configuration for ${type} ${cyan(name)}`)));
    }
}

class $$InvalidServiceConfigError extends $$InvalidModuleConfigError {
    constructor(name) {
        super('service', name);
    }
}

class $$InvalidFactoryConfigError extends $$InvalidModuleConfigError {
    constructor(name) {
        super('factory', name);
    }
}

class $$InvalidControllerConfigError extends $$InvalidModuleConfigError {
    constructor(name) {
        super('Controller', name);
    }
}

class $$InvalidDirectiveConfigError extends $$InvalidModuleConfigError {
    constructor(name) {
        super('directive', name);
    }
}

export {
    $$InvalidConfigError,
    $$InvalidServiceConfigError,
    $$InvalidFactoryConfigError,
    $$InvalidControllerConfigError,
    $$InvalidDirectiveConfigError
};
