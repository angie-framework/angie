// // Test Modules
import {assert, expect} from        'chai';
import simple, {mock, spy} from     'simple-mock';
import $LogProvider from            'angie-log';
//
// // System Modules
// import repl from                    'repl';
import http from 'http';
import https from 'https';
//
//
// // Angie Modules
import app from                         '../../src/Angie';
import {$$server} from       '../../src/Server';
import $Request from                '../../src/services/$Request';
import $Response from                '../../src/services/$Response';
//
// const P = process;
//
// describe('$$watch', function() {});
// describe('$$shell', function() {});
describe('$$server', function() {
    let request,
        response,
        listenSpy,
        endSpy;

    beforeEach(function() {
        endSpy = spy();
        listenSpy = spy();
        request = {
            path: 'test'
        };
        response = {
            end: endSpy,
            _header: 'test'
        };
        mock(app, '$$load', () => true);
        mock(http, 'createServer', function(fn) {
            fn(request, response);
            return {
                listen: listenSpy
            };
        });
        mock($Request.prototype, '$$route', function() {
            return {
                then: (fn) => fn()
            };
        });
        mock($Response.prototype, 'constructor', function() {
            return {
                response: response
            };
        });
        spy(app, 'service');
        spy(app, '$$tearDown');
        mock($LogProvider, 'error', () => true);
        mock($LogProvider, 'info', () => true);
    });
    afterEach(() => simple.restore());
    it('test call with http', function() {
        $$server([ 1234 ]);
        assert(app.$$load.called);
        assert(http.createServer.called);
        assert(https.createServer.notCalled);
        expect(app.service.callCount).to.eq(2);
        assert($Request.prototype.$$route.called);
        expect($LogProvider.error.calls[0].args).to.deep.eq('test', 'test');
        assert(endSpy.called);
        expect(listenSpy.calls[0].args[0]).to.eq(1234);
        expect(
            app.$$tearDown.calls[0].args
        ).to.deep.eq([ '$request', '$response' ]);
        expect($LogProvider.info.calls[0].args[0]).to.eq('Serving on port 1234');
    });
    it('test call with https & port 443', function() {
        $$server([ 443 ]);
        assert(app.$$load.called);
        assert(http.createServer.notCalled);
        assert(https.createServer.called);
        expect(app.service.callCount).to.eq(2);
        assert($Request.prototype.$$route.called);
        expect($LogProvider.error.calls[0].args).to.deep.eq('test', 'test');
        assert(endSpy.called);
        expect(listenSpy.calls[0].args[0]).to.eq(1234);
        expect(
            app.$$tearDown.calls[0].args
        ).to.deep.eq([ '$request', '$response' ]);
        expect($LogProvider.info.calls[0].args[0]).to.eq('Serving on port 1234');
    });
});

// TODO test call with SSL
    // Both use ssl and port 443
// TODO test call with http
// TODO test called with webserver
// TODO test response types
