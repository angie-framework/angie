// Test Modules
import { expect, assert } from  'chai';
import simple, { mock } from            'simple-mock';

// System Modules
import yargs from       'yargs';

describe('index', function() {
    const noop = () => false,
        src = '../../src/index';

    beforeEach(function() {
        yargs([]);
        mock(console, 'log', noop);
    });
    afterEach(function() {
        delete require.cache[ require.resolve(src) ]
        simple.restore();
    });
    it('test "help" command', function() {
        yargs([ 'help' ]);

        require(src);
        expect(console.log.callCount).to.eq(16);
    });
    it('test -h', function() {
        yargs([ '-h' ]);
        require(src);
        expect(console.log.callCount).to.eq(16);
    });
    it('test --help', function() {
        yargs([ '--help' ]);
        require(src);
        expect(console.log.callCount).to.eq(16);
    });
});