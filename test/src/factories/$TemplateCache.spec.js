// Test Modules
import {expect, assert} from        'chai';
import simple, {mock, stub} from          'simple-mock';

// System Modules
import {default as $Injector} from  'angie-injector';

// Angie Modules
import {
    $$templateLoader,
    $resourceLoader
} from                              '../../../src/factories/$TemplateCache';


describe('$resourceLoader', function() {
    let $response,
        $injectorMock;

    beforeEach(function() {
        $response = {};
        $injectorMock = mock($Injector, 'get', () => $response);
    });
    afterEach(function() {
        simple.restore();
    })
    it('test no $response', function() {
        $injectorMock.returnWith(false);
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
            'TEST<script type="text/javascript" src="test.js"></script>'
        );
    });
    it('test array of files string src', function() {
        $response.$responseContent = 'TEST';
        expect($resourceLoader([ 'test.js', 'test1.js' ])).to.be.true;
        expect($response.$responseContent).to.eq(
            'TEST<script type="text/javascript" src="test.js"></script>' +
            '<script type="text/javascript" src="test1.js"></script>'
        );
    });
    it('test single file string src with </body>', function() {
        $response.$responseContent = '</body>';
        expect($resourceLoader('test.js')).to.be.true;
        expect($response.$responseContent).to.eq(
            '<script type="text/javascript" src="test.js"></script></body>'
        );
    });
});