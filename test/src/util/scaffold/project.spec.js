// Test Modules
import { expect, assert } from          'chai';
import simple, { mock } from            'simple-mock';

// System Modules
import yargs from                       'yargs';
import { default as promptly } from     'promptly';
import fs from                          'fs';
import util from                        'util';
import { bold, green } from             'chalk';
import $LogProvider from                'angie-log';

// Angie Modules
const TEST_ENV =                        global.TEST_ENV || 'src',
    project =                           require(`../../../../${TEST_ENV}/util/scaffold/project`),
    $$ProjectCreationError =            require(`../../../../${TEST_ENV}/services/$Exceptions`).$$ProjectCreationError,
    p = process;

describe('$$createProject', function() {
    let noop = () => null;

    beforeEach(function() {
        yargs([]);
        mock(fs, 'mkdirSync', noop);
        mock(fs, 'readFileSync', noop);
        mock(util, 'format', () => 'test');
        mock(fs, 'writeFileSync', noop);
        mock($LogProvider, 'info', noop);
        mock(p, 'exit', noop);
        mock(promptly, 'confirm', function(_, fn) {
            fn(null, true);
        });
        mock(promptly, 'prompt', function(_, obj = {}, fn) {
            fn(null, true);
        });
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
    it('test successful project creation with directory', function() {
        project({
            name: 'test',
            dir: 'test/'
        });
        expect(fs.mkdirSync.calls[0].args[0]).to.eq('test');
        expect(fs.mkdirSync.calls[1].args[0]).to.eq('test/src');
        expect(fs.mkdirSync.calls[2].args[0]).to.eq('test/src/constants');
        expect(fs.mkdirSync.calls[3].args[0]).to.eq('test/src/configs');
        expect(fs.mkdirSync.calls[4].args[0]).to.eq('test/src/services');
        expect(fs.mkdirSync.calls[5].args[0]).to.eq('test/src/factories');
        expect(fs.mkdirSync.calls[6].args[0]).to.eq('test/src/controllers');
        expect(fs.mkdirSync.calls[7].args[0]).to.eq('test/src/directives');
        expect(fs.mkdirSync.calls[8].args[0]).to.eq('test/test');
        expect(fs.mkdirSync.calls[9].args[0]).to.eq('test/static');
        expect(fs.mkdirSync.calls[10].args[0]).to.eq('test/templates');
        expect(promptly.confirm.calls[0].args[0]).to.eq(
            `${bold(green('Do you want Angie to cache static assets?'))} :`
        );
        expect(util.format.calls[0].args.slice(0, 4)).to.deep.eq([
            fs.readFileSync(
                '../../../../src/templates/json/AngieFile.template.json'
            ),
            'test',
            'test',
            true
        ]);
        expect(util.format.calls[0].args[4].val).to.eq(true);
        expect(fs.writeFileSync.calls[0].args).to.deep.eq([
            'test/AngieFile.json', 'test', 'utf8'
        ]);
        expect(
            $LogProvider.info.calls[0].args[0]
        ).to.eq('Project successfully created');
        expect(p.exit.calls[0].args[0]).to.eq(0);
    });
    it('test successful project creation with -n argument', function() {
        yargs([ '-n', 'test' ]);
        project({
            name: 'test1',
            dir: 'test/'
        });
        expect(fs.mkdirSync.calls[0].args[0]).to.eq('test');
        expect(fs.mkdirSync.calls[1].args[0]).to.eq('test/src');
        expect(fs.mkdirSync.calls[2].args[0]).to.eq('test/src/constants');
        expect(fs.mkdirSync.calls[3].args[0]).to.eq('test/src/configs');
        expect(fs.mkdirSync.calls[4].args[0]).to.eq('test/src/services');
        expect(fs.mkdirSync.calls[5].args[0]).to.eq('test/src/factories');
        expect(fs.mkdirSync.calls[6].args[0]).to.eq('test/src/controllers');
        expect(fs.mkdirSync.calls[7].args[0]).to.eq('test/src/directives');
        expect(fs.mkdirSync.calls[8].args[0]).to.eq('test/test');
        expect(fs.mkdirSync.calls[9].args[0]).to.eq('test/static');
        expect(fs.mkdirSync.calls[10].args[0]).to.eq('test/templates');
        expect(promptly.confirm.calls[0].args[0]).to.eq(
            `${bold(green('Do you want Angie to cache static assets?'))} :`
        );
        expect(util.format.calls[0].args.slice(0, 4)).to.deep.eq([
            fs.readFileSync(
                '../../../../src/templates/json/AngieFile.template.json'
            ),
            'test',
            'test',
            true
        ]);
        expect(util.format.calls[0].args[4].val).to.eq(true);
        expect(fs.writeFileSync.calls[0].args).to.deep.eq([
            'test/AngieFile.json', 'test', 'utf8'
        ]);
        expect(
            $LogProvider.info.calls[0].args[0]
        ).to.eq('Project successfully created');
        expect(p.exit.calls[0].args[0]).to.eq(0);
    });
    it('test successful project creation with --name argument', function() {
        yargs([ '--name', 'test' ]);
        project({
            name: 'test1',
            dir: 'test/'
        });
        expect(fs.mkdirSync.calls[0].args[0]).to.eq('test');
        expect(fs.mkdirSync.calls[1].args[0]).to.eq('test/src');
        expect(fs.mkdirSync.calls[2].args[0]).to.eq('test/src/constants');
        expect(fs.mkdirSync.calls[3].args[0]).to.eq('test/src/configs');
        expect(fs.mkdirSync.calls[4].args[0]).to.eq('test/src/services');
        expect(fs.mkdirSync.calls[5].args[0]).to.eq('test/src/factories');
        expect(fs.mkdirSync.calls[6].args[0]).to.eq('test/src/controllers');
        expect(fs.mkdirSync.calls[7].args[0]).to.eq('test/src/directives');
        expect(fs.mkdirSync.calls[8].args[0]).to.eq('test/test');
        expect(fs.mkdirSync.calls[9].args[0]).to.eq('test/static');
        expect(fs.mkdirSync.calls[10].args[0]).to.eq('test/templates');
        expect(promptly.confirm.calls[0].args[0]).to.eq(
            `${bold(green('Do you want Angie to cache static assets?'))} :`
        );
        expect(util.format.calls[0].args.slice(0, 4)).to.deep.eq([
            fs.readFileSync(
                '../../../../src/templates/json/AngieFile.template.json'
            ),
            'test',
            'test',
            true
        ]);
        expect(util.format.calls[0].args[4].val).to.eq(true);
        expect(fs.writeFileSync.calls[0].args).to.deep.eq([
            'test/AngieFile.json', 'test', 'utf8'
        ]);
        expect(
            $LogProvider.info.calls[0].args[0]
        ).to.eq('Project successfully created');
        expect(p.exit.calls[0].args[0]).to.eq(0);
    });
    it('test successful project creation with directory false confirm', function() {
        mock(promptly, 'confirm', function(_, fn) {
            fn(false);
        });
        mock(promptly, 'prompt', function(_, obj = {}, fn) {
            fn(null, false);
        });
        project({
            name: 'test',
            dir: 'test/'
        });
        expect(fs.mkdirSync.calls[0].args[0]).to.eq('test');
        expect(fs.mkdirSync.calls[1].args[0]).to.eq('test/src');
        expect(fs.mkdirSync.calls[2].args[0]).to.eq('test/src/constants');
        expect(fs.mkdirSync.calls[3].args[0]).to.eq('test/src/configs');
        expect(fs.mkdirSync.calls[4].args[0]).to.eq('test/src/services');
        expect(fs.mkdirSync.calls[5].args[0]).to.eq('test/src/factories');
        expect(fs.mkdirSync.calls[6].args[0]).to.eq('test/src/controllers');
        expect(fs.mkdirSync.calls[7].args[0]).to.eq('test/src/directives');
        expect(fs.mkdirSync.calls[8].args[0]).to.eq('test/test');
        expect(fs.mkdirSync.calls[9].args[0]).to.eq('test/static');
        expect(fs.mkdirSync.calls[10].args[0]).to.eq('test/templates');
        expect(promptly.confirm.calls[0].args[0]).to.eq(
            `${bold(green('Do you want Angie to cache static assets?'))} :`
        );
        assert(promptly.prompt.called);
        expect(util.format.calls[0].args.slice(0, 4)).to.deep.eq([
            fs.readFileSync(
                '../../../../src/templates/json/AngieFile.template.json'
            ),
            'test',
            'test',
            false
        ]);
        expect(util.format.calls[0].args[4].val).to.eq(false);
        expect(fs.writeFileSync.calls[0].args).to.deep.eq([
            'test/AngieFile.json', 'test', 'utf8'
        ]);
        expect(
            $LogProvider.info.calls[0].args[0]
        ).to.eq('Project successfully created');
        expect(p.exit.calls[0].args[0]).to.eq(0);
    });
    it('test successful project creation with "." directory', function() {
        project({
            name: 'test',
            dir: '.'
        });
        expect(fs.mkdirSync.calls[0].args[0]).to.eq('src');
        expect(fs.mkdirSync.calls[1].args[0]).to.eq('src/constants');
        expect(fs.mkdirSync.calls[2].args[0]).to.eq('src/configs');
        expect(fs.mkdirSync.calls[3].args[0]).to.eq('src/services');
        expect(fs.mkdirSync.calls[4].args[0]).to.eq('src/factories');
        expect(fs.mkdirSync.calls[5].args[0]).to.eq('src/controllers');
        expect(fs.mkdirSync.calls[6].args[0]).to.eq('src/directives');
        expect(fs.mkdirSync.calls[7].args[0]).to.eq('test');
        expect(fs.mkdirSync.calls[8].args[0]).to.eq('static');
        expect(fs.mkdirSync.calls[9].args[0]).to.eq('templates');
        expect(promptly.confirm.calls[0].args[0]).to.eq(
            `${bold(green('Do you want Angie to cache static assets?'))} :`
        );
        assert(promptly.prompt.called);
        expect(util.format.calls[0].args.slice(0, 4)).to.deep.eq([
            fs.readFileSync(
                '../../../../src/templates/json/AngieFile.template.json'
            ),
            'test',
            'test',
            true
        ]);
        expect(util.format.calls[0].args[4].val).to.eq(true);
        expect(fs.writeFileSync.calls[0].args).to.deep.eq([
            'AngieFile.json', 'test', 'utf8'
        ]);
        expect(
            $LogProvider.info.calls[0].args[0]
        ).to.eq('Project successfully created');
        expect(p.exit.calls[0].args[0]).to.eq(0);
    });
    it('test successful project creation with -d', function() {
        yargs([ '-d', 'test' ]);
        project({
            name: 'test',
            dir: 'test/'
        });
        expect(fs.mkdirSync.calls[0].args[0]).to.eq('test');
        expect(fs.mkdirSync.calls[1].args[0]).to.eq('test/src');
        expect(fs.mkdirSync.calls[2].args[0]).to.eq('test/src/constants');
        expect(fs.mkdirSync.calls[3].args[0]).to.eq('test/src/configs');
        expect(fs.mkdirSync.calls[4].args[0]).to.eq('test/src/services');
        expect(fs.mkdirSync.calls[5].args[0]).to.eq('test/src/factories');
        expect(fs.mkdirSync.calls[6].args[0]).to.eq('test/src/controllers');
        expect(fs.mkdirSync.calls[7].args[0]).to.eq('test/src/directives');
        expect(fs.mkdirSync.calls[8].args[0]).to.eq('test/test');
        expect(fs.mkdirSync.calls[9].args[0]).to.eq('test/static');
        expect(fs.mkdirSync.calls[10].args[0]).to.eq('test/templates');
        expect(promptly.confirm.calls[0].args[0]).to.eq(
            `${bold(green('Do you want Angie to cache static assets?'))} :`
        );
        expect(util.format.calls[0].args.slice(0, 4)).to.deep.eq([
            fs.readFileSync(
                '../../../../src/templates/json/AngieFile.template.json'
            ),
            'test',
            'test',
            true
        ]);
        expect(util.format.calls[0].args[4].val).to.eq(true);
        expect(fs.writeFileSync.calls[0].args).to.deep.eq([
            'test/AngieFile.json', 'test', 'utf8'
        ]);
        expect(
            $LogProvider.info.calls[0].args[0]
        ).to.eq('Project successfully created');
        expect(p.exit.calls[0].args[0]).to.eq(0);
    });
    it('test successful project creation with --dir', function() {
        yargs([ '--dir', 'test' ]);
        project({
            name: 'test',
            dir: 'test/'
        });
        expect(fs.mkdirSync.calls[0].args[0]).to.eq('test');
        expect(fs.mkdirSync.calls[1].args[0]).to.eq('test/src');
        expect(fs.mkdirSync.calls[2].args[0]).to.eq('test/src/constants');
        expect(fs.mkdirSync.calls[3].args[0]).to.eq('test/src/configs');
        expect(fs.mkdirSync.calls[4].args[0]).to.eq('test/src/services');
        expect(fs.mkdirSync.calls[5].args[0]).to.eq('test/src/factories');
        expect(fs.mkdirSync.calls[6].args[0]).to.eq('test/src/controllers');
        expect(fs.mkdirSync.calls[7].args[0]).to.eq('test/src/directives');
        expect(fs.mkdirSync.calls[8].args[0]).to.eq('test/test');
        expect(fs.mkdirSync.calls[9].args[0]).to.eq('test/static');
        expect(fs.mkdirSync.calls[10].args[0]).to.eq('test/templates');
        expect(promptly.confirm.calls[0].args[0]).to.eq(
            `${bold(green('Do you want Angie to cache static assets?'))} :`
        );
        expect(util.format.calls[0].args.slice(0, 4)).to.deep.eq([
            fs.readFileSync(
                '../../../../src/templates/json/AngieFile.template.json'
            ),
            'test',
            'test',
            true
        ]);
        expect(util.format.calls[0].args[4].val).to.eq(true);
        expect(fs.writeFileSync.calls[0].args).to.deep.eq([
            'test/AngieFile.json', 'test', 'utf8'
        ]);
        expect(
            $LogProvider.info.calls[0].args[0]
        ).to.eq('Project successfully created');
        expect(p.exit.calls[0].args[0]).to.eq(0);
    });
    it('test successful project creation with no directory', function() {
        const CWD = p.cwd();

        project({
            name: 'test'
        });
        expect(fs.mkdirSync.calls[0].args[0]).to.eq(`${CWD}/test`);
        expect(fs.mkdirSync.calls[1].args[0]).to.eq(`${CWD}/test/src`);
        expect(fs.mkdirSync.calls[2].args[0]).to.eq(
            `${CWD}/test/src/constants`
        );
        expect(fs.mkdirSync.calls[3].args[0]).to.eq(
            `${CWD}/test/src/configs`
        );
        expect(fs.mkdirSync.calls[4].args[0]).to.eq(
            `${CWD}/test/src/services`
        );
        expect(fs.mkdirSync.calls[5].args[0]).to.eq(
            `${CWD}/test/src/factories`
        );
        expect(fs.mkdirSync.calls[6].args[0]).to.eq(
            `${CWD}/test/src/controllers`
        );
        expect(fs.mkdirSync.calls[7].args[0]).to.eq(
            `${CWD}/test/src/directives`
        );
        expect(
            fs.mkdirSync.calls[8].args[0]
        ).to.eq(`${CWD}/test/test`);
        expect(
            fs.mkdirSync.calls[9].args[0]
        ).to.eq(`${CWD}/test/static`);
        expect(
            fs.mkdirSync.calls[10].args[0]
        ).to.eq(`${CWD}/test/templates`);
        expect(promptly.confirm.calls[0].args[0]).to.eq(
            `${bold(green('Do you want Angie to cache static assets?'))} :`
        );
        assert(promptly.prompt.called);
        expect(util.format.calls[0].args.slice(0, 4)).to.deep.eq([
            fs.readFileSync(
                '../../../../src/templates/json/AngieFile.template.json'
            ),
            'test',
            'test',
            true
        ]);
        expect(util.format.calls[0].args[4].val).to.eq(true);
        expect(fs.writeFileSync.calls[0].args).to.deep.eq([
            `${CWD}/test/AngieFile.json`, 'test', 'utf8'
        ]);
        expect(
            $LogProvider.info.calls[0].args[0]
        ).to.eq('Project successfully created');
        expect(p.exit.calls[0].args[0]).to.eq(0);
    });
});