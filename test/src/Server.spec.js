// Test Modules
import {assert, expect} from        'chai';
import simple, {mock, spy} from     'simple-mock';
import $LogProvider from            'angie-log';

// System Modules
import http from 'http';
import https from 'https';

// Angie Modules
import app from                     '../../src/Angie';
import {$$server} from              '../../src/Server';
import $Request from                '../../src/services/$Request';
import * as $Responses from         '../../src/services/$Response';

describe('$$server', function() {
    let request,
        response,
        listen,
        end,
        head,
        writeSync,
        e;

    beforeEach(function() {
        e = new Error();
        listen = spy(function() {
            return {
                catch(fn) { fn(e); }
            };
        });
        end = spy();
        request = {
            url: 'test'
        };
        response = {
            end,
            _header: 'test'
        };
        mock(app, '$$load', function() {
            return {
                then(fn) { fn(); }
            };
        });
        mock(http, 'createServer', function(fn) {
            fn(request, response);
            return { listen };
        });
        mock(https, 'createServer', function(fn) {
            fn(request, response);
            return { listen };
        });
        mock($Request.prototype, '$$route', function() {
            return {
                then(fn) {
                    fn();
                    return {
                        catch(fn) {
                            fn(e);
                        }
                    };
                }
            };
        });
        writeSync = spy();
        head = spy(function() {
            return { writeSync };
        });
        mock(
            $Responses,
            'ErrorResponse',
            function() {
                return { head };
            }
        );
        mock($Responses.default.prototype, 'constructor', function() {
            return { response };
        });
        mock(app, '$$tearDown', () => true);
        mock($LogProvider, 'error', () => true);
        mock($LogProvider, 'warn', () => true);
        mock($LogProvider, 'info', () => true);
    });
    afterEach(() => simple.restore());
    it('test call with http', function() {
        $$server([ 'server', 1234 ]);
        assert(app.$$load.called);
        assert(http.createServer.called);
        expect(https.createServer).to.not.have.been.called;
        assert($Request.prototype.$$route.called);
        expect($LogProvider.error.calls[0].args).to.deep.eq([ 'test', 'test' ]);
        expect($Responses.ErrorResponse.calls[0].args[0]).to.deep.eq(e);
        assert(head.called);
        assert(writeSync.called);
        expect(listen.calls[0].args[0]).to.eq(1234);
        expect(
            app.$$tearDown.calls[0].args
        ).to.deep.eq([ '$request', '$response' ]);
        expect(
            app.$$tearDown.calls[1].args
        ).to.deep.eq([ '$request', '$response' ]);
        expect(end.callCount).to.eq(2);
        expect($LogProvider.info.calls[0].args[0]).to.eq('Serving on port 1234');
    });
    it('test call with https and port 443', function() {
        $$server([ 'server', 443 ]);
        assert(app.$$load.called);
        expect(http.createServer).to.not.have.been.called;
        assert(https.createServer.called);
        assert($Request.prototype.$$route.called);
        expect($LogProvider.error.calls[0].args).to.deep.eq([ 'test', 'test' ]);
        expect($Responses.ErrorResponse.calls[0].args[0]).to.deep.eq(e);
        assert(head.called);
        assert(writeSync.called);
        expect($LogProvider.error.calls[1].args).to.deep.eq([ 'test', 'test' ]);
        expect(listen.calls[0].args[0]).to.eq(443);
        expect(
            app.$$tearDown.calls[0].args
        ).to.deep.eq([ '$request', '$response' ]);
        expect(
            app.$$tearDown.calls[1].args
        ).to.deep.eq([ '$request', '$response' ]);
        expect(end.callCount).to.eq(2);
        expect($LogProvider.info.calls[0].args[0]).to.eq('Serving on port 443');
    });
    it('test call with https and --usessl', function() {
        $$server([ 'server', 1234, '--usessl' ]);
        assert(app.$$load.called);
        expect(http.createServer).to.not.have.been.called;
        assert(https.createServer.called);
        assert($Request.prototype.$$route.called);
        expect($LogProvider.error.calls[0].args).to.deep.eq([ 'test', 'test' ]);
        expect($Responses.ErrorResponse.calls[0].args[0]).to.deep.eq(e);
        assert(head.called);
        assert(writeSync.called);
        expect($LogProvider.error.calls[1].args).to.deep.eq([ 'test', 'test' ]);
        expect(listen.calls[0].args[0]).to.eq(443);
        expect(
            app.$$tearDown.calls[0].args
        ).to.deep.eq([ '$request', '$response' ]);
        expect(
            app.$$tearDown.calls[1].args
        ).to.deep.eq([ '$request', '$response' ]);
        expect(end.callCount).to.eq(2);
        expect($LogProvider.info.calls[0].args[0]).to.eq('Serving on port 443');
    });
    it('test < 400 level response', function() {
        response.statusCode = 399;
        $$server([ 'server', 1234 ]);
        expect($LogProvider.info.calls[0].args).to.deep.eq([ 'test', 'test' ]);
    });
    it('test < 500 level response', function() {
        response.statusCode = 499;
        $$server([ 'server', 1234 ]);
        expect($LogProvider.warn.calls[0].args).to.deep.eq([ 'test', 'test' ]);
    });
    it('test >= 500 or unknown level response', function() {
        response.statusCode = 500;
        $$server([ 'server', 1234 ]);
        expect($LogProvider.error.calls[0].args).to.deep.eq([ 'test', 'test' ]);
    });
});