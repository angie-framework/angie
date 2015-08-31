// Test Modules
import {assert, expect} from        'chai';
import simple, {mock, spy} from     'simple-mock';

// System Modules
import {default as $Injector} from  'angie-injector';

// Angie Modules
// import $CacheFactory from           '../../../src/factories/$CacheFactory';
import * as $TemplateCache from     '../../../src/factories/$TemplateCache';
import * as $Responses from         '../../../src/services/$Response';

describe('$Response', function() {
    it('constructor', function() {
        expect(new $Responses.default({})).to.deep.eq({
            response: { $responseContent: '' }
        });
    });
});

describe('$Responses', function() {
    let $request,
        $response,
        $injectorMock,
        writeHeadSpy,
        writeSpy,
        response;

    beforeEach(function() {
        writeHeadSpy = spy();
        writeSpy = spy();
        $request = {
            headers: {
                accept: 'text/html,'
            },
            path: 'test.html'
        };
        $response = {
            test: 'test',
            writeHead: writeHeadSpy,
            write: writeSpy
        };

    });
    afterEach(function() {
        simple.restore();
    });
    describe('BaseResponse', function() {
        beforeEach(function() {
            $injectorMock = mock($Injector, 'get', () => [ $request, $response ]);
        });
        describe('constructor', function() {
            it('test content type from request.headers.accept', function() {
                response = new $Responses.BaseResponse();
                expect(response.responseContentType).to.eq('text/html');
                expect(
                    response.responseHeaders[ 'Content-Type' ]
                ).to.eq('text/html');
            });
            it('test content type no "," use request.path', function() {
                $injectorMock.returnWith([
                    {
                        headers: {
                            accept: 'text/plain'
                        },
                        path: 'test.html'
                    },
                    $response
                ]);
                response = new $Responses.BaseResponse();
                expect(response.responseContentType).to.eq('text/html');
                expect(
                    response.responseHeaders[ 'Content-Type' ]
                ).to.eq('text/html');
            });
            it('test content type no headers use request.path', function() {
                $injectorMock.returnWith([
                    {
                        headers: {},
                        path: 'test.html'
                    },
                    $response
                ]);
                response = new $Responses.BaseResponse();
                expect(response.responseContentType).to.eq('text/html');
                expect(
                    response.responseHeaders[ 'Content-Type' ]
                ).to.eq('text/html');
            });
        });
        describe('methods', function() {
            beforeEach(function() {
                response = new $Responses.BaseResponse();
            });
            it('head', function() {
                expect(response.response.test).to.eq('test');
                response.head();
                expect(writeHeadSpy.calls[0].args).to.deep.eq(
                    [ 200, 'OK', { 'Content-Type': 'text/html' } ]
                );
            });
            describe('write', function() {
                beforeEach(function() {
                    mock($TemplateCache, '$$templateLoader', () => 'test');
                });
                it(
                    'test write calls response.write and $$templateLoader',
                    function() {
                        response.write();
                        expect(
                            response.response.write.calls[0].args[0]
                        ).to.eq('test');
                    }
                );
            });
        });
    });
    describe('AssetResponse', function() {
        let BaseResponseMock;

        beforeEach(function() {
            BaseResponseMock = mock(
                $Responses.BaseResponse.prototype,
                'constructor',
                () => true
            );
            $injectorMock = mock($Injector, 'get', () => $request);
        });
        describe('constructor', function() {
            it('test content type from request.headers.accept', function() {
                response = new $Responses.AssetResponse();
                assert(BaseResponseMock.called);
                expect(response.path).to.eq('test.html');
            });
        });
        describe('methods', function() {
            let headMock;

            beforeEach(function() {

                headMock = mock(
                    $Responses.BaseResponse.prototype,
                    'head',
                    () => true
                );
                response = new $Responses.AssetResponse();
            });
            it('head', function() {
                response.head();
                assert(headMock.called);
            });
            // describe('write', function() {
            //     let assetCacheGetMock,
            //         assetCachePutMock,
            //         $$templateLoaderMock;
            //
            //     it('test no asset', function() {
            //         assetCacheGetMock = spy();
            //         assetCachePutMock = spy();
            //         mock($CacheFactory.prototype, 'constructor', () => ({
            //             get: spy(() => false),
            //             put: spy()
            //         }));
            //         $$templateLoaderMock = mock(
            //             $TemplateCache,
            //             '$$templateLoader',
            //             () => false
            //         );
            //     });
            //     it('test no asset cache, no asset template', function() {
            //         let head = spy(),
            //             write = spy();
            //         mock(
            //             $Responses.UnknownResponse.prototype,
            //             'constructor',
            //             () => ({
            //                 head: head,
            //                 write: write
            //             })
            //         );
            //         response.write();
            //         assert(head.called);
            //         assert(write.called);
            //     });
            //     // Test no asset cache, no asset
            //     // Test asset templateLoader, no caching
            //     // Test asset assetCache, no caching
            //     // Test asset templateLoader, caching
            //     // Test asset assetCache, caching
            // });
        });
    });
});
