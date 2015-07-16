'use strict'; 'use strong';

// Test Modules
import {expect} from        'chai';
import {mock} from          'simple-mock';

// Angie Modules
import * as decorators from         '../../../src/util/decorators';

describe('decorators', function() {
    beforeEach(function() {
        if (typeof global.app === 'undefined') {
            global.app = {};
        }
    });
    describe('Controller', function() {
        beforeEach(function() {
            if (typeof global.app.Controllers === 'undefined') {
                global.app.Controllers = {};
            }
            mock(decorators, 'Controller', () => false);
        });
        it('test Controller declaration', function() {
            @decorators.Controller
            class Test {}
            expect(decorators.Controller.calls[0].args[0]).to.deep.eq(Test);
        });
    });
    describe('directive', function() {
        beforeEach(function() {
            if (typeof global.app.directives === 'undefined') {
                global.app.directives = {};
            }
            mock(decorators, 'directive', () => false);
        });
        it('test Controller declaration', function() {
            @decorators.directive
            class Test {}
            expect(decorators.directive.calls[0].args[0]).to.deep.eq(Test);
        });
    });
});