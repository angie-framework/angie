'use strict'; 'use strong';

// Test Modules
import {assert, expect} from            'chai';
import simple, {mock} from              'simple-mock';

// System Modules
import fs from                          'fs';
import util from                        'util';
import $LogProvider from                'angie-log';

// Angie Modules
import {
    default as project
} from                                  '../../../../src/util/scaffold/project';
import {$$ProjectCreationError} from    '../../../../src/util/$ExceptionsProvider';

const p = process;

describe('$$createProject', function() {
    let noop = () => null;

    beforeEach(function() {
        mock(fs, 'mkdirSync', noop);
        mock(fs, 'readFileSync', noop);
        mock(util, 'format', () => 'test');
        mock(fs, 'writeFileSync', noop);
        mock($LogProvider, 'info', noop);
        mock(p, 'exit', noop);
    });
    afterEach(() => simple.restore());
    it('test $$createProject called without a name', function() {
        expect(project).to.throw($$ProjectCreationError);
    });
    it('test $$createProject called without a name', function() {
        expect(project.bind(null, {
            name: '111'
        })).to.throw($$ProjectCreationError);
        expect(project.bind(null, {
            name: '#][]\\$%'
        })).to.throw($$ProjectCreationError);
    });
    it('test $$createProject scaffolding error', function() {
        fs.mkdirSync.returnWith(new Error());
        expect(project).to.throw($$ProjectCreationError);
    });
    it('test successful project creation with location', function() {
        project({
            name: 'test',
            location: 'test/'
        });
        expect(fs.mkdirSync.calls[0].args[0]).to.eq('test');
        expect(fs.mkdirSync.calls[1].args[0]).to.eq('test/src');
        expect(fs.mkdirSync.calls[2].args[0]).to.eq('test/src/constants');
        expect(fs.mkdirSync.calls[3].args[0]).to.eq('test/src/configs');
        expect(fs.mkdirSync.calls[4].args[0]).to.eq('test/src/services');
        expect(fs.mkdirSync.calls[5].args[0]).to.eq('test/src/controllers');
        expect(fs.mkdirSync.calls[6].args[0]).to.eq('test/src/directives');
        expect(fs.mkdirSync.calls[7].args[0]).to.eq('test/static');
        expect(fs.mkdirSync.calls[8].args[0]).to.eq('test/templates');
        assert(util.format.called);
        expect(fs.writeFileSync.calls[0].args).to.deep.eq([
            'test/AngieFile.json', 'test', 'utf8'
        ]);
        expect($LogProvider.info.calls[0].args[0]).to.eq('Project successfully created');
        expect(p.exit.calls[0].args[0]).to.eq(0);
    });
    it('test successful project creation with "." location', function() {
        project({
            name: 'test',
            location: '.'
        });
        expect(fs.mkdirSync.calls[0].args[0]).to.eq('src');
        expect(fs.mkdirSync.calls[1].args[0]).to.eq('src/constants');
        expect(fs.mkdirSync.calls[2].args[0]).to.eq('src/configs');
        expect(fs.mkdirSync.calls[3].args[0]).to.eq('src/services');
        expect(fs.mkdirSync.calls[4].args[0]).to.eq('src/controllers');
        expect(fs.mkdirSync.calls[5].args[0]).to.eq('src/directives');
        expect(fs.mkdirSync.calls[6].args[0]).to.eq('static');
        expect(fs.mkdirSync.calls[7].args[0]).to.eq('templates');
        assert(util.format.called);
        expect(fs.writeFileSync.calls[0].args).to.deep.eq([
            'AngieFile.json', 'test', 'utf8'
        ]);
        expect($LogProvider.info.calls[0].args[0]).to.eq('Project successfully created');
        expect(p.exit.calls[0].args[0]).to.eq(0);
    });
    it('test successful project creation with no location', function() {
        project({
            name: 'test'
        });
        expect(fs.mkdirSync.calls[0].args[0]).to.eq('/Users/jg/angie/test');
        expect(fs.mkdirSync.calls[1].args[0]).to.eq('/Users/jg/angie/test/src');
        expect(fs.mkdirSync.calls[2].args[0]).to.eq(
            '/Users/jg/angie/test/src/constants'
        );
        expect(fs.mkdirSync.calls[3].args[0]).to.eq(
            '/Users/jg/angie/test/src/configs'
        );
        expect(fs.mkdirSync.calls[4].args[0]).to.eq(
            '/Users/jg/angie/test/src/services'
        );
        expect(fs.mkdirSync.calls[5].args[0]).to.eq(
            '/Users/jg/angie/test/src/controllers'
        );
        expect(fs.mkdirSync.calls[6].args[0]).to.eq(
            '/Users/jg/angie/test/src/directives'
        );
        expect(
            fs.mkdirSync.calls[7].args[0]
        ).to.eq('/Users/jg/angie/test/static');
        expect(
            fs.mkdirSync.calls[8].args[0]
        ).to.eq('/Users/jg/angie/test/templates');
        assert(util.format.called);
        expect(fs.writeFileSync.calls[0].args).to.deep.eq([
            '/Users/jg/angie/test/AngieFile.json', 'test', 'utf8'
        ]);
        expect($LogProvider.info.calls[0].args[0]).to.eq('Project successfully created');
        expect(p.exit.calls[0].args[0]).to.eq(0);
    });
});
