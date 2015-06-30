'use strict'; 'use strong';

// Test Modules
import {expect} from                'chai';

// Angie Modules
import {default as $MimeType} from  '../../../src/util/$MimeTypeProvider';

describe('$MimeTypeProvider', function() {
    describe('_', function() {
        it(
            'test _ called without any arguments returns the default Content-Type',
            function() {
                expect($MimeType._()).to.eq('text/plain');
            }
        );
        it(
            'test _ called with a type not in MIME_TYPES returns default Content-Type',
            function() {
                expect($MimeType._('test')).to.eq('text/plain');
            }
        );
        it('test known mime type', function() {
            expect($MimeType._('svg')).to.eq('image/svg+xml');
        });
    });
    describe('fromPath', function() {
        it('test path without a "."', function() {
            expect($MimeType.fromPath('test')).to.eq('text/plain');
        });
        it('test path with a ".", but of unknown type', function() {
            expect($MimeType.fromPath('test.test')).to.eq('text/plain');
        });
        it('test path with a "." and of unknown type', function() {
            expect($MimeType.fromPath('test.svg')).to.eq('image/svg+xml');
        });
    });
});