// Test Modules
import {expect} from                'chai';
import {mock} from                  'simple-mock';

// System Modules
import {default as $Injector} from  'angie-injector';

// Angie Modules
import * as $Responses from         '../../../src/services/$Response';

describe('$Response', function() {
    it('constructor', function() {
        expect(new $Responses.default({})).to.deep.eq({
            response: { $responseContent: '' }
        });
    });
});

describe('BaseResponse', function() {
    describe('constructor', function() {
        let $request,
            $response,
            $injectorMock;

        beforeEach(function() {
            $request = $response = {};
            $injectorMock = mock($Injector, 'get', () => [ $request, $response ]);
        });
        it('test content type from request.headers.accept', function() {
            $injectorMock.returnWith([
                {
                    headers: {
                        accept: 'text/html,'
                    }
                },
                $response
            ]);
            let response = new $Responses.BaseResponse();
            expect(response.responseContentType).to.eq('text/html');
            expect(response.responseHeaders[ 'Content-Type']).to.eq('text/html');
        });
    });
});