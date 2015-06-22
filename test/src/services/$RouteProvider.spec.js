'use strict'; 'use strong';

import {$routeProvider} from '../../../src/services/$RouteProvider';

let expect = global.expect;

describe('$RequestProvider', function() {
    describe('_parseUrlParams', function() {
        let parse = $routeProvider._parseURLParams;

        it('test no pattern', function() {
            expect(parse(undefined, '/test.json')).to.deep.eq({});
        });
        it('test no path', function() {
            expect(parse(/test/, '/test.json')).to.deep.eq({});
        });
        it('test single param', function() {
            expect(parse(/(test).json/, '/test.json')).to.deep.eq({ '0': 'test' });
        });
        it('test numeric param', function() {
            expect(parse(/([0-9]).json/, '/5.json')).to.deep.eq({ '0': '5' });
        });
        it('test double param', function() {
            expect(
                parse(/(test)\/(test).json/, '/test/test.json')
            ).to.deep.eq({
                '0': 'test',
                '1': 'test'
            });
        });
        it('test five params', function() {
            expect(
                parse(
                    /(test)\/([0-9])\/([A-Z]+)\/([a-z])\/(blah).json/,
                    'test/1/TEST/m/blah.json'
                )
            ).to.deep.eq({
                '0': 'test',
                '1': '1',
                '2': 'TEST',
                '3': 'm',
                '4': 'blah'
            });
        });

        // This is weird, but I'm not sure its a huge problem
        it('test unmatched param', function() {
            expect(
                parse(
                    /(test)\/([0-9]).json/,
                    'test/A.json'
                )
            ).to.deep.eq({
                '0': 'test/A.json'
            });
        });
    });
});
