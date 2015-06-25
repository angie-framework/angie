'use strict'; 'use strong';

// System Modules
import gulp from                'gulp';
import {exec} from              'child_process';
import eslint from              'gulp-eslint';
import istanbul from            'gulp-istanbul';
import {Instrumenter} from      'isparta';
import mocha from               'gulp-mocha';
import chalk from               'chalk';

// Angie Modules
import $log from './src/util/$LogProvider';

const src = 'src/**/*.js',
      testSrc = 'test/**/*.spec.js',
      docSrc = 'doc',
      coverageDir = 'coverage';

gulp.task('eslint', function () {
    gulp.src([ src, testSrc ]).pipe(
        eslint()
    ).pipe(
        eslint.format()
    ).pipe(
        eslint.failOnError()
    );
});
gulp.task('mocha', function(cb) {
    gulp.src(src).pipe(
        istanbul({
            instrumenter: Instrumenter,
            includeUntested: true
        })
    ).pipe(
        istanbul.hookRequire()
    ).on('finish', function() {
        $log.info('Running Angie Mocha test suite');
        gulp.src(testSrc, { read: false }).pipe(mocha({
            reporter: 'spec'
        })).pipe(
            istanbul.writeReports({
                reporters: [ 'text', 'text-summary', 'cobertura', 'clover' ]
            })
        ).on('end', cb);
    });
});
gulp.task('esdoc', function(cb) {
    $log.info('Generating Angie documentation');
    exec('esdoc -c esdoc.json', cb);
});
gulp.task('watch', [ 'eslint', 'mocha', 'esdoc' ], function() {
    gulp.watch([ src, testSrc, '../gh-pages-angie/**' ], [ 'mocha', 'esdoc' ]);
});
gulp.task('watch:mocha', [ 'eslint', 'mocha' ], function() {
    gulp.watch([ src, testSrc, '../gh-pages-angie/**' ], [ 'mocha' ]);
});
gulp.task('watch:esdoc', [ 'esdoc' ], function() {
    gulp.watch([ src, '../gh-pages-angie/**' ], [ 'esdoc' ]);
});
gulp.task('default', [ 'eslint', 'mocha', 'esdoc' ]);
