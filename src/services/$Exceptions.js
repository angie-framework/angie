/**
 * @module $Exceptions.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 10/01/2015
 */

// System Modules
import chalk from           'chalk';
import $LogProvider from    'angie-log';

/**
 * @desc A generic error thrown when an invalid configuration file is passed.
 * This can occur when an invalid or empty JSON object is passed (if the found
 * AngieFile is JSON) or if the JavaScript inside the config file is invalid.
 * It can also imply a valid AngieFile was not found. Valid names for this file
 * are "angiefile" with any mixed case written as JSON or a JavaScript file
 * (".js" or ".es6") that exports a JavaScript object.
 * @returns {object} Error
 * @since 0.4.4
 * @access public
 * @extends {Error}
 * @example new $Exceptions.$$InvalidConfigError();
 */
class $$InvalidConfigError {
    constructor() {
        const msg = 'Invalid application configuration. Check your ' +
            chalk.cyan('AngieFile');

        $LogProvider.error(msg);
        return new Error(msg);
    }
}

/**
 * @desc A parent class for the invalid module errors thrown when a declared
 * module value is not valid for the specified module type.
 * @returns {object} SyntaxError
 * @since 0.4.4
 * @access private
 * @extends {SyntaxError}
 */
class $$InvalidModuleConfigError {
    constructor(type = 'directive', name) {
        const msg = `Invalid configuration for ${type} ${chalk.cyan(name)}`;

        $LogProvider.error(msg);
        return new SyntaxError(msg);
    }
}

/**
 * @desc The invalid module value error associated with services.
 * @returns {object} SyntaxError
 * @since 0.4.4
 * @access public
 * @extends {$$InvalidModuleConfigError}
 * @example new $Exceptions().$$InvalidServiceConfigError();
 */
class $$InvalidServiceConfigError extends $$InvalidModuleConfigError {
    constructor(name) {
        return super('service', name);
    }
}

/**
 * @desc The invalid module value error associated with factories.
 * @returns {object} SyntaxError
 * @since 0.4.4
 * @access public
 * @extends {$$InvalidModuleConfigError}
 * @example new $Exceptions().$$InvalidFactoryConfigError();
 */
class $$InvalidFactoryConfigError extends $$InvalidModuleConfigError {
    constructor(name) {
        return super('factory', name);
    }
}

/**
 * @desc The invalid module value error associated with Controllers.
 * @returns {object} SyntaxError
 * @since 0.4.4
 * @access public
 * @extends {$$InvalidModuleConfigError}
 * @example new $Exceptions().$$InvalidControllerConfigError();
 */
class $$InvalidControllerConfigError extends $$InvalidModuleConfigError {
    constructor(name) {
        return super('Controller', name);
    }
}

/**
 * @desc The invalid module value error associated with directives.
 * @returns {object} SyntaxError
 * @since 0.4.4
 * @access public
 * @extends {$$InvalidModuleConfigError}
 * @example new $Exceptions().$$InvalidDirectiveConfigError();
 */
class $$InvalidDirectiveConfigError extends $$InvalidModuleConfigError {
    constructor(name) {
        return super(undefined, name);
    }
}

export {
    $$InvalidConfigError,
    $$InvalidServiceConfigError,
    $$InvalidFactoryConfigError,
    $$InvalidControllerConfigError,
    $$InvalidDirectiveConfigError
};