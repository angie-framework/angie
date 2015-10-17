// Test Modules
import { expect } from              'chai';
import simple, { mock } from        'simple-mock';

// System Modules

import cheerio from                 'cheerio';

// Angie Modules
import $compile from                '../../../src/factories/$Compile';

const TEST_ENV =                    global.TEST_ENV || 'src',
    $$ngieIgnoreFactory =               require(`../../../${TEST_ENV}/directives/ngie-ignore`);

describe('$$ngieIgnoreFactory', function() {
    it('test ngieIgnoreFactory returns', function() {
        let obj = $$ngieIgnoreFactory();
        expect(obj.priority).to.eq(1);
        expect(obj.restrict).to.eq('AECM');
        expect(obj.link).to.be.a.function;
    });
    describe('link', function() {
        let template,
            scope;

        beforeEach(function() {
            template =
                '<div><div class="test" ngie-ignore>{{test}}</div>{{test}}</div>';
            scope = { test: 'test' };
        });
        it('test template strings ignored inside of ngie-ignore', function() {
            $compile(template)(scope).then(function(t) {
                expect(t).to.eq(
                    '<div><div class="test">{{test}}</div>test</div>'
                );
            });
        });
    });
});