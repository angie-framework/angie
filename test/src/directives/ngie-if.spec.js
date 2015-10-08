// Test Modules
import { expect } from              'chai';
import simple, { mock } from        'simple-mock';

// System Modules
import cheerio from                 'cheerio';

// Angie Modules
const TEST_ENV =                    global.TEST_ENV || 'src',
    $$ngieIfFactory =             require(`../../../${TEST_ENV}/directives/ngie-if`);

describe('$$ngieIfFactory', function() {
    let $,
        el,
        scope,
        attrs,
        fn;

    beforeEach(function() {
        $ = cheerio.load('<div><div class="test" ngie-if="test"></div></div>');
        el = $('.test');
    });
    it('test ngieIfFactory returns', function() {
        let obj = $$ngieIfFactory();
        expect(obj.priority).to.eq(1);
        expect(obj.restrict).to.eq('AECM');
        expect(obj.link).to.be.a.function;
    });
    describe('link', function() {
        let el,
            scope,
            attrs,
            fn;

        beforeEach(function() {
            let $ = cheerio.load(
                '<div><div class="test" ngie-if="test"></div></div>'
            );
            scope = { test: true };
            attrs = { ngieIf: 'test' };
            el = $('.test');
            fn = $$ngieIfFactory().link;
        });
        it('test ngieIf directive condition found in link, attr removed', function() {
            fn(scope, el, attrs);
            expect($.html()).to.eq('<div><div class="test"></div></div>');
            expect(attrs.hasOwnProperty('ngieIf')).to.be.false;
        });
    });
});