// Test Modules
import {assert, expect} from        'chai';
import simple, {mock, spy} from     'simple-mock';

// System Modules
import {default as $Injector} from  'angie-injector';

// Angie Modules
import {config} from                '../../../src/Config';
import $CacheFactory from           '../../../src/factories/$CacheFactory';
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
            $responseContent: '',
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
            it('test content type empty headers use request.path', function() {
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
            it('test content type no headers use request.path', function() {
                $injectorMock.returnWith([
                    {
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
                expect(response.head()).to.eq(response);
                expect(writeHeadSpy.calls[0].args).to.deep.eq(
                    [ 200, 'Ok', { 'Content-Type': 'text/html' } ]
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
                expect(response.head()).to.eq(response);
                assert(headMock.called);
            });
            describe('write', function() {
                let assetCacheGetMock,
                    assetCachePutMock,
                    $$templateLoaderMock;

                beforeEach(function() {
                    mock($CacheFactory.prototype, 'constructor', () => false);
                    assetCacheGetMock = mock(
                        $CacheFactory.prototype,
                        'get',
                        () => false
                    );
                    assetCachePutMock = mock(
                        $CacheFactory.prototype,
                        'put',
                        () => true
                    );
                    $$templateLoaderMock = mock(
                        $TemplateCache,
                        '$$templateLoader',
                        () => 'test'
                    );
                    response.response = $response;
                });
                afterEach(function() {
                    delete config.cacheStaticAssets;
                    simple.restore();
                });
                it('test no asset cache, no asset template', function() {
                    let headMock,
                        unknownWriteSpy = spy();
                    $$templateLoaderMock.returnWith(false);
                    mock(
                        $Responses.UnknownResponse.prototype,
                        'constructor',
                        () => true
                    );
                    headMock = mock(
                        $Responses.UnknownResponse.prototype,
                        'head',
                        () => ({ write: unknownWriteSpy })
                    );
                    response.write();
                    assert(headMock.called);
                    assert(unknownWriteSpy.called);
                });
                it('test asset from $$templateLoader, no caching', function() {
                    response.write();
                    expect(assetCachePutMock).to.not.have.been.called;
                    assert(writeSpy.called);
                });
                it('test asset from $$templateLoader, caching is false', function() {
                    config.cacheStaticAssets = false;
                    response.write();
                    expect(assetCachePutMock).to.not.have.been.called;
                    assert(writeSpy.called);
                });
                it('test asset from $$templateLoader, caching', function() {
                    config.cacheStaticAssets = true;
                    response.write();
                    expect(
                        assetCachePutMock.calls[0].args
                    ).to.deep.eq([ 'test.html', 'test' ]);
                    assert(writeSpy.called);
                });
                describe('assetCache', function() {
                    beforeEach(function() {
                        assetCacheGetMock.returnWith('test');
                        $$templateLoaderMock.returnWith(false);
                    });
                    it('test asset from assetCache, no caching', function() {
                        response.write();
                        expect(assetCachePutMock).to.not.have.been.called;
                        assert(writeSpy.called);
                    });
                    it('test asset from assetCache, caching is false', function() {
                        config.cacheStaticAssets = false;
                        response.write();
                        expect(assetCachePutMock).to.not.have.been.called;
                        assert(writeSpy.called);
                    });
                    it('test asset from assetCache, caching', function() {
                        config.cacheStaticAssets = true;
                        response.write();
                        expect(
                            assetCachePutMock.calls[0].args
                        ).to.deep.eq([ 'test.html', 'test' ]);
                        assert(writeSpy.called);
                    });
                });
            });
        });
    });
    describe('RedirectResponse', function() {
        let BaseResponseMock,
            $injectorMock;

        beforeEach(function() {
            BaseResponseMock = mock(
                $Responses.BaseResponse.prototype,
                'constructor',
                function() {
                    this.otherwise = 'test2';
                }
            );
        });
        describe('constructor', function() {
            it('test with argument path', function() {
                let response = new $Responses.RedirectResponse('test');
                assert(BaseResponseMock.called);
                expect(response.path).to.eq('test');
            });
            it('test without argument path', function() {
                let response = new $Responses.RedirectResponse();
                assert(BaseResponseMock.called);
                expect(response.path).to.eq('test2');
            });
        });
        describe('methods', function() {
            let setHeaderSpy;

            beforeEach(function() {
                response = new $Responses.RedirectResponse('test');
                response.response = $response;

                response.response.setHeader = setHeaderSpy = spy();
            });
            it('head', function() {
                expect(response.head()).to.eq(response);
                expect(response.response.statusCode).to.eq(302);
                expect(
                    setHeaderSpy.calls[0].args
                ).to.deep.eq([ 'Location', 'test' ]);
            });
            it('write', function() {
                response.write();
            });
        });
    });
    describe('UnknownResponse', function() {
        let BaseResponseMock,
            $$templateLoaderMock;

        beforeEach(function() {
            BaseResponseMock = mock(
                $Responses.BaseResponse.prototype,
                'constructor',
                () => true
            );
            $$templateLoaderMock = mock(
                $TemplateCache,
                '$$templateLoader',
                () => 'test'
            );
        });
        it('constructor', function() {
            let response = new $Responses.UnknownResponse();
            assert(BaseResponseMock.called);
            expect($$templateLoaderMock.calls[0].args[0]).to.eq('404.html');
        });
        describe('methods', function() {
            beforeEach(function() {
                response = new $Responses.UnknownResponse();
                response.response = $response;
            });
            it('head', function() {
                expect(response.head()).to.eq(response);
                expect(
                    writeHeadSpy.calls[0].args
                ).to.deep.eq([ 404, 'File Not Found', $response.headers ]);
            });
            it('write', function() {
                response.write();
                expect(writeSpy.calls[0].args[0]).to.eq('test');
            });
        });
    });
    describe('ErrorResponse', function() {
        let BaseResponseMock;

        beforeEach(function() {
            BaseResponseMock = mock(
                $Responses.BaseResponse.prototype,
                'constructor',
                () => true
            );
        });
        describe('constructor', function() {
            afterEach(function() {
                delete config.development;
            });
            it('test no error', function() {
                let response = new $Responses.ErrorResponse();
                assert(BaseResponseMock.called);
                expect(response.html).to.eq('<h1>Internal Server Error</h1>');
            });
            it('test error', function() {
                config.development = true;
                let e = new Error('test'),
                    response = new $Responses.ErrorResponse(e);
                assert(BaseResponseMock.called);
                expect(response.html).to.eq(`<h1>${e}</h1><p>${e.stack}</p>`);
            });
        });
        describe('methods', function() {
            beforeEach(function() {
                response = new $Responses.ErrorResponse();
                response.response = $response;
            });
            it('head', function() {
                expect(response.head()).to.eq(response);
                expect(
                    writeHeadSpy.calls[0].args
                ).to.deep.eq([ 500, 'Internal Server Error', $response.headers ]);
            });
            it('write', function() {
                response.write();
                expect(writeSpy.calls[0].args[0]).to.eq(response.html);
            });
        });
    });
});