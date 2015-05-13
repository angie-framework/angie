'use strict';

// TODO pathify? system?
import app from '../../../src/Base';
import $injector from '../../../src/services/$Injector';
import $log from '../../../src/util/$LogProvider';

const assert =          require('assert'),
      simple =          require('simple-mock');

const mock = simple.mock;



describe('$Injector', function() {
    let get,
        spy;
    beforeEach(function() {
        get = $injector.get;
        mock($log, 'error', function() {});
        mock(process, 'exit', function() {});
        app.service('test', 'test');
        app.service('test2', 'test2');
    });
    afterEach(function() {
        app.services
    });
    describe('get', function() {
        it('test get returns nothing if no arguments', function() {
            expect(get()).to.be.undefined;
            expect($log.error).to.have.been.called;
            expect(process.exit).to.have.been.called;
        });
        it('test argument not found', function() {
            expect(get('test', 'test2', 'test3')).to.deep.eq([ 'test', 'test2' ]);
            expect($log.error).to.have.been.called;
            expect(process.exit).to.have.been.called;
        });
        it('test all arguments found', function() {
            app.service('test3', 'test3');
            expect(get('test', 'test2', 'test3')).to.deep.eq([ 'test', 'test2', 'test3' ]);
            expect($log.error).to.not.have.been.called;
            expect(process.exit).to.not.have.been.called;
        });
        it(
            'test a request for a single argument returns a single provision',
            function() {
                expect(get('test')).to.deep.eq('test');
                expect($log.error).to.not.have.been.called;
                expect(process.exit).to.not.have.been.called;
            }
        );
    });
});
