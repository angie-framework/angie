// Test Modules
import {expect} from        'chai';
import {mock} from          'simple-mock';

// Angie Modules
import $Response from       '../../../src/services/$Response';

describe('$Response', function() {
    it('constructor', function() {
        expect(new $Response({})).to.deep.eq({
            $responseContent: ''
        });
    });
});