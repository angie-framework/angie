// Test Modules
import { expect } from          'chai';
import simple, { mock } from    'simple-mock';

// System Modules
import chalk from               'chalk';
import $LogProvider from        'angie-log';

// Angie Modules
const TEST_ENV =                global.TEST_ENV || 'src',
    $Exceptions =               require(`../../../${TEST_ENV}/services/$Exceptions`);

describe('$Exceptions', function() {
    beforeEach(function() {
        mock($LogProvider, 'error', () => false);
    });
    it('$$InvalidConfigError', function() {
        const msg = 'Invalid application configuration. Check your ' +
            chalk.cyan('AngieFile'),
            e = new $Exceptions.$$InvalidConfigError();
        expect($LogProvider.error.calls[0].args[0]).to.eq(msg);
        expect(e).to.deep.eq(new Error(msg));
    });
    describe('$$InvalidModuleConfigError', function() {
        const msgFn = (t, n) => `Invalid configuration for ${t} ${chalk.cyan(n)}`;

        it('$$InvalidServiceConfigError', function() {
            const msg = msgFn('service', 'test'),
                e = new $Exceptions.$$InvalidServiceConfigError('test');
            expect($LogProvider.error.calls[0].args[0]).to.eq(msg);
            expect(e).to.deep.eq(new SyntaxError(msg));
        });
        it('$$InvalidFactoryConfigError', function() {
            const msg = msgFn('factory', 'test'),
                e = new $Exceptions.$$InvalidFactoryConfigError('test');
            expect($LogProvider.error.calls[0].args[0]).to.eq(msg);
            expect(e).to.deep.eq(new SyntaxError(msg));
        });
        it('$$InvalidControllerConfigError', function() {
            const msg = msgFn('Controller', 'test'),
                e = new $Exceptions.$$InvalidControllerConfigError('test');
            expect($LogProvider.error.calls[0].args[0]).to.eq(msg);
            expect(e).to.deep.eq(new SyntaxError(msg));
        });
        it('$$InvalidDirectiveConfigError', function() {
            const msg = msgFn('directive', 'test'),
                e = new $Exceptions.$$InvalidDirectiveConfigError('test');
            expect($LogProvider.error.calls[0].args[0]).to.eq(msg);
            expect(e).to.deep.eq(new SyntaxError(msg));
        });
    });
});