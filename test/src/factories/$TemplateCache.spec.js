// Test Modules
import {expect} from                'chai';
import simple, {mock} from          'simple-mock';

// System Modules
import {default as $Injector} from  'angie-injector';

// Angie Modules
import {$resourceLoader} from       '../../../src/factories/$TemplateCache';


describe('$resourceLoader', function() {
    let $request,
        $response,
        $injectorMock;

    beforeEach(function() {
        $request = {
            path: '/'
        };
        $response = {};
        $injectorMock = mock($Injector, 'get', () => [ $request, $response ]);
    });
    afterEach(function() {
        simple.restore();
    });
    it('test no $request', function() {
        $injectorMock.returnWith([ null, {} ]);
        expect($resourceLoader()).to.be.false;
    });
    it('test no $response', function() {
        $injectorMock.returnWith([ {}, null ]);
        expect($resourceLoader()).to.be.false;
    });
    it('test non-object $request', function() {
        $request = '';
        expect($resourceLoader()).to.be.false;
    });
    it('test non-object $response', function() {
        $response = '';
        expect($resourceLoader()).to.be.false;
    });
    it('test non-js file', function() {
        expect($resourceLoader('test')).to.be.true;
        expect($response.$responseContent).to.eq('');
    });
    it('test single file string src', function() {
        $response.$responseContent = 'TEST';
        expect($resourceLoader('test.js')).to.be.true;
        expect($response.$responseContent).to.eq(
            'TEST<script type="text/javascript" src="/test.js"></script>'
        );
    });
    it('test single file string src non-root path', function() {
        $response.$responseContent = 'TEST';
        $request.path = '/index/test';
        expect($resourceLoader('test.js')).to.be.true;
        expect($response.$responseContent).to.eq(
            'TEST<script type="text/javascript" src="/../../test.js"></script>'
        );
    });
    it('test array of files string src', function() {
        $response.$responseContent = 'TEST';
        expect($resourceLoader([ 'test.js', 'test1.js' ])).to.be.true;
        expect($response.$responseContent).to.eq(
            'TEST<script type="text/javascript" src="/test.js"></script>' +
            '<script type="text/javascript" src="/test1.js"></script>'
        );
    });
    it('test single file string src with </body>', function() {
        $response.$responseContent = '</body>';
        expect($resourceLoader('test.js')).to.be.true;
        expect($response.$responseContent).to.eq(
            '<script type="text/javascript" src="/test.js"></script></body>'
        );
    });
});