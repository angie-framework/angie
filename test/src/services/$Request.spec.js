// Test Modules
import {assert, expect} from        'chai';
import simple, {mock, spy} from     'simple-mock';

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
        afterEach(simple.restore);
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
            writeSync;

        beforeEach(function() {
            writeSync = spy();
            head = spy(function() {
                return { writeSync };
            });
            RedirectResponseMock = mock(
                $Responses,
                'RedirectResponse',
                function() {
                    return { head };
                }
            );
        });
        afterEach(simple.restore);
        it('test $redirect', function() {
            new $Request(request).$redirect('test');
            expect(RedirectResponseMock.calls[0].args[0]).to.eq('test');
            assert(head.called);
            assert(writeSync.called);
        });
    });
    describe('$$route', function() {
        let request,
            head,
            write,
            $isRoutedAssetResourceResponseMock;

        beforeEach(function() {
            write = spy();
            head = spy(function() {
                return { write };
            });
            $isRoutedAssetResourceResponseMock = mock(
                $Responses.AssetResponse,
                '$isRoutedAssetResourceResponse',
                () => false
            );
        });
        afterEach(simple.restore);
        describe('test UnknownResponse', function() {
            beforeEach(function() {
                request = new $Request({
                    url: 'http://localhost:3000/test2'
                });
                mock(
                    $Responses,
                    'UnknownResponse',
                    function() {
                        return { head };
                    }
                );

            });
            it('test no found route, no asset, no otherwise', function() {
                request.$$route();
                assert($Responses.UnknownResponse.called);
                assert(head.called);
                assert(write.called);
            });
        });
        describe('test RedirectResponse', function() {
            let writeSync;

            beforeEach(function() {
                mock($Routes, 'fetch', () => ({
                    otherwise: 'test',
                    routes: {}
                }));
                request = new $Request({
                    url: 'http://localhost:3000/test'
                });
                writeSync = spy();
                head.returnWith({ writeSync });
                mock(
                    $Responses,
                    'RedirectResponse',
                    function() {
                        return { head };
                    }
                );
            });
            it('test no found route, no asset with otherwise', function() {
                request.$$route();
                assert($Responses.RedirectResponse.called);
                assert(head.called);
                assert(writeSync.called);
            });
        });
        describe('test AssetResponse', function() {
            beforeEach(function() {
                $isRoutedAssetResourceResponseMock.returnWith(true);
                mock($Routes, 'fetch', () => ({ routes: {} }));
                request = new $Request({
                    url: 'http://localhost:3000/test.html'
                });
                mock(
                    $Responses.AssetResponse.prototype,
                    'constructor',
                    function() {
                        return { head };
                    }
                );
            });
            xit('test no found route, asset', function() {
                request.$$route();
                expect(
                    $isRoutedAssetResourceResponseMock.calls[0].args[0]
                ).to.eq('/test.html');
                assert($Responses.AssetResponse.called);
                assert(head.called);
                assert(write.called);
            });
        });
        describe('test ControllerTemplatePathResponse', function() {
            beforeEach(function() {
                mock($Routes, 'fetch', () => ({
                    otherwise: 'test',
                    routes: {
                        '/test': {
                            templatePath: 'test.html'
                        }
                    }
                }));
                request = new $Request({
                    url: 'http://localhost:3000/test'
                });
                mock(
                    $Responses,
                    'ControllerTemplatePathResponse',
                    function() {
                        return { head };
                    }
                );
            });
            it('test found route', function() {
                request.$$route();
                assert($Responses.ControllerTemplatePathResponse.called);
                assert(head.called);
                assert(write.called);
            });
        });
        describe('test ControllerTemplateResponse', function() {
            beforeEach(function() {
                mock($Routes, 'fetch', () => ({
                    otherwise: 'test',
                    routes: {
                        '/test': {
                            template: 'test'
                        }
                    }
                }));
                request = new $Request({
                    url: 'http://localhost:3000/test'
                });
                mock(
                    $Responses,
                    'ControllerTemplateResponse',
                    function() {
                        return { head };
                    }
                );
            });
            it('test found route', function() {
                request.$$route();
                assert($Responses.ControllerTemplateResponse.called);
                assert(head.called);
                assert(write.called);
            });
        });
        describe('test ErrorResponse', function() {
            beforeEach(function() {
                mock($Routes, 'fetch', () => ({
                    otherwise: 'test',
                    routes: {
                        '/test': {
                            template: 'test'
                        }
                    }
                }));
                request = new $Request({
                    url: 'http://localhost:3000/test'
                });
                mock(
                    $Responses,
                    'ControllerTemplateResponse',
                    function() {
                        throw new Error();
                    }
                );
                mock(
                    $Responses,
                    'ErrorResponse',
                    function() {
                        return { head };
                    }
                );
            });
            it('test error', function() {
                request.$$route();
                assert($Responses.ErrorResponse.called);
                assert(head.called);
                assert(write.called);
            });
        });
        describe('test ControllerTemplateResponse', function() {
            beforeEach(function() {
                mock($Routes, 'fetch', () => ({
                    routes: {
                        regExp: {
                            '/([A-Za-z]+)/': {
                                template: 'test'
                            }
                        }
                    }
                }));
                mock($Routes, '$$parseURLParams', () => true);
                request = new $Request({
                    url: 'http://localhost:3000/test'
                });
                mock(
                    $Responses,
                    'ControllerTemplateResponse',
                    function() {
                        return { head };
                    }
                );
            });
            it('test regExp route', function() {
                request.$$route();
                assert($Routes.$$parseURLParams.called);
            });
        });
    });
});