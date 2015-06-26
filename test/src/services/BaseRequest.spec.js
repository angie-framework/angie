'use strict'; 'use strong';

// Test Modules
import {expect} from        'chai';
import {mock} from          'simple-mock';

// Angie Modules
import {BaseRequest} from   '../../../src/services/BaseRequest';

describe('BaseRequest', function() {
    let request;

    beforeEach(function() {
        request = new BaseRequest('/test.json', {
            headers: {
                accept: ''
            },
            url: '/test.json'
        }, {});
        request.routes = {
            '/test.json': {},
            regExp: {}
        };
    });
    describe('_route', function() {
        beforeEach(function() {
            mock(request, 'controllerPath', function() {});
            mock(request, 'otherPath', function() {});
        });
        describe('test RegExp path', function() {
            it('test RegExp path does not match request path', function() {
                request.routes.regExp = {
                    '/notTest/': {}
                };
                request._route();
                expect(request.otherPath).to.have.been.called;
            });
            it('test RegExp path matches request path', function() {
                request.path = 'notBlah.json';
                request.routes.regExp = {
                    '/not([A-Za-z]+)/': {}
                };
                request._route();
                expect(request.request.query[0]).to.eq('Blah');
                expect(request.controllerPath).to.have.been.called;
                expect(request.otherPath).to.not.have.been.called;
            });
        });
        describe('test string path', function() {
            it('test string path matches request path', function() {
                request._route();
                expect(request.controllerPath).to.have.been.called;
            });
            it('test string path does not matche request path', function() {
                request.path = '/test2.json';
                request._route();
                expect(request.otherPath).to.have.been.called;
            });
        });
        // describe('test $Compile parsing', function() {
        //     it('test templatePath associated with a controller', function() {
        //
        //     });
        // });
    });
});
