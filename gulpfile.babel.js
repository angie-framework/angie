import {default as register} from   'babel-core/register';
register({
    only: [
        '**/node_modules/angie*/**',
        '**/src/**',
        '**/test/**'
    ],
    stage: 0
});

// System Modules
import fs from              'fs';
import gulp from            'gulp';
import {argv} from          'yargs';
import eslint from          'gulp-eslint';
import jscs from            'gulp-jscs';
import {Instrumenter} from  'isparta';
import mocha from           'gulp-mocha';
import istanbul from        'gulp-istanbul';
import cobertura from       'istanbul-cobertura-badger';
import esdoc from           'gulp-esdoc';
import babel from           'gulp-babel';
import copy from            'gulp-copy';
import {bold, red} from     'chalk';

const bread = (str) => bold(red(str));

const SRC_DIR = 'src',
    SRC = `${SRC_DIR}/**/*.js`,
    TRANSPILED_SRC = 'dist',
    TEST_SRC = 'test/**/*.spec.js',
    DOC_SRC = 'doc',
    COVERAGE_SRC = 'coverage';

// Build Tasks
gulp.task('eslint', function () {
    gulp.src([ SRC, TEST_SRC ]).pipe(eslint().on('error', function(e) {
        throw e;
    }));
});
gulp.task('jscs', [ 'eslint' ], function () {
    return gulp.src([ SRC, TEST_SRC ])
        .pipe(jscs({
            fix: true,
            configPath: '.jscsrc',
            esnext: true
        }));
});
gulp.task('istanbul', [ 'jscs' ], function(cb) {
    gulp.src('src/**/*.js').pipe(istanbul({
        instrumenter: Instrumenter,
        includeUntested: true,
        babel: {
            stage: 0
        }
    })).pipe(istanbul.hookRequire()).on('finish', cb);
});
gulp.task('mocha', [ 'istanbul' ], function() {
    return gulp.src([
        'test/src/util.spec.js',
        'test/**/*.spec.js'
    ]).pipe(mocha({
        reporter: 'spec'
    })).pipe(istanbul.writeReports({
        dir: 'coverage',
        reportOpts: {
            dir: 'coverage'
        },
        reporters: [ 'text', 'text-summary', 'html', 'cobertura' ]
    }));
});
gulp.task('cobertura', [ 'mocha' ], function(cb) {
    cobertura('coverage/cobertura-coverage.xml', 'svg', cb);
});
gulp.task('esdoc', [ 'cobertura' ], function() {
    return gulp.src(SRC_DIR).pipe(esdoc({
        destination: DOC_SRC
    }));
});
gulp.task('babel', [ 'esdoc' ], function(cb) {
    gulp.src(SRC).pipe(babel({
        comments: false
    })).pipe(gulp.dest(TRANSPILED_SRC)).on('finish', function() {
        gulp.src(`${SRC_DIR}/templates/**`).pipe(
            copy(`${TRANSPILED_SRC}/templates`, {
                prefix: 2
            })
        );
        cb();
    });
});

// Utility Tasks
gulp.task('bump', function() {
    const version = argv.version,
        bump = (f) => fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace(
            /[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,2}/,
            version
        ));
    if (version) {

        // Verify that the version is in the CHANGELOG
        if (fs.readFileSync('CHANGELOG.md', 'utf8').indexOf(version) === -1) {
            throw new Error(bread('Version has no entry in CHANGELOG.md'));
        }

        bump('bin/angie');
        bump('bin/angie-dist');
        bump('package.json');
    } else {
        throw new Error(bread('No version specified!!'));
    }
});

// Bundled Tasks
gulp.task('test', [ 'mocha' ]);
gulp.task('watch', [ 'test' ], function() {
    gulp.watch([ SRC, TEST_SRC ], [ 'test' ]);
});
gulp.task('watch:babel', [ 'babel' ], function() {
    gulp.watch([ 'src/**' ], [ 'babel' ]);
});
gulp.task('default', [ 'babel' ]);

