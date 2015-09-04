// Test Modules
import {assert, expect} from        'chai';
import {mock, spy} from             'simple-mock';

// Angie Modules
import {default as $Routes} from    '../../../src/factories/$RouteProvider';
import * as $Responses from         '../../../src/services/$Response';
import $Request from                '../../../src/services/$Request';

describe('$Request', function() {
    let request = {
            url: 'http://localhost:3000/test.html?id=1'
        };

    describe('constructor', function() {

        beforeEach(function() {
            mock($Routes, 'fetch', () => ({
                routes: 'test',
                otherwise: 'test'
            }));
        });
        it('test constructor declarations', function() {
            let $request = new $Request(request);
            expect($request.request).to.eq(request);
            expect($request.url).to.eq(request.url);
            expect($request.path).to.eq('/test.html');
            expect($request.query).to.deep.eq({ id: '1' });
            expect($request.routes).to.eq('test');
            expect($request.otherwise).to.eq('test');
        });
    });
    describe('$redirect', function() {
        let RedirectResponseMock,
            head,
            write;

        beforeEach(function() {
            write = spy();
            head = spy(function() {
                return { write };
            });
            RedirectResponseMock = mock(
                $Responses,
                'RedirectResponse',
                function() {
                    return { head };
                }
            );
        });
        it('test $redirect', function() {
            new $Request(request).$redirect('test');
            expect(RedirectResponseMock.calls[0].args[0]).to.eq('test');
            assert(head.called);
            assert(write.called);
        });
    });
});


//     let request;
//
//     beforeEach(function() {
//         request = new BaseRequest('/test.json', {
//             headers: {
//                 accept: ''
//             },
//             url: '/test.json'
//         }, {});
//         request.routes = {
//             '/test.json': {},
//             regExp: {}
//         };
//     });
//     describe('$$route', function() {
//         beforeEach(function() {
//             mock(request, '$controllerPath', function() {});
//             mock(request, 'otherPath', function() {});
//         });
//         describe('test RegExp path', function() {
//             it('test RegExp path does not match request path', function() {
//                 request.routes.regExp = {
//                     '/notTest/': {}
//                 };
//                 request.$$route();
//                 expect(request.otherPath).to.have.been.called;
//             });
//             it('test RegExp path matches request path', function() {
//                 request.path = 'notBlah.json';
//                 request.routes.regExp = {
//                     '/not([A-Za-z]+)/': {}
//                 };
//                 request.$$route();
//                 expect(request.request.query[0]).to.eq('Blah');
//                 expect(request.$controllerPath).to.have.been.called;
//                 expect(request.otherPath).to.not.have.been.called;
//             });
//         });
//         describe('test string path', function() {
//             it('test string path matches request path', function() {
//                 request.$$route();
//                 expect(request.$controllerPath).to.have.been.called;
//             });
//             it('test string path does not matche request path', function() {
//                 request.path = '/test2.json';
//                 request.$$route();
//                 expect(request.otherPath).to.have.been.called;
//             });
//         });
//     });
// });