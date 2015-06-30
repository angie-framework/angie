'use strict'; 'use strong';

// System Modules
import gulp from                'gulp';
import {exec} from              'child_process';
import eslint from              'gulp-eslint';
import jscs from                'gulp-jscs';
import istanbul from            'gulp-istanbul';
import {Instrumenter} from      'isparta';
import mocha from               'gulp-mocha';
import chalk from               'chalk';

// import babel from 'gulp-babel';
import documentation from 'gulp-documentation';
// import gulpDoxx from 'gulp-doxx';
// import jsdoc from 'gulp-jsdoc';

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
gulp.task('jscs', [ 'eslint' ], function () {
    return gulp.src([ src, testSrc ])
        .pipe(jscs({
            fix: true,
            configPath: '.jscsrc',
            esnext: true
        }));
});
gulp.task('mocha', function() {
    let proc;

    return new Promise(function(resolve, reject) {
        proc = gulp.src(src).pipe(
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
            }).on('error', function(e) {
                console.log(chalk.bold(e));
                resolve();
            }).on('end', function() {
                resolve();
            }));
        });
    }).then(function() {
        return proc.pipe(

            // TODO fail if under accepted limit
            istanbul.writeReports({
                reporters: [ 'text', 'text-summary', 'cobertura', 'clover' ]
            })
        );
    });
});
gulp.task('esdoc', function(cb) {
    $log.info('Generating Angie documentation');
    exec('esdoc -c esdoc.json', cb);
});
gulp.task('documentation', function() {
    $log.info('Generating Angie documentation');
    // gulp.src(src)
    //     .pipe(documentation({
    //         format: 'html',
    //         polyglot: true
    //     }))
    //     .pipe(gulp.dest('md-documentation'));
    exec('documentation -c esdoc.json', cb);
});
// gulp.task('docs', function() {
//
//   gulp.src(src)
//     .pipe(gulpDoxx({
//       title: 'Angie',
//       urlPrefix: '/docs',
//       debug: true,
//       raw: true
//     }))
//     .pipe(gulp.dest('docs'));
//
// });
gulp.task('jsdoc', function() {
    return gulp.src('src/Angular.js')
        .pipe(jsdoc.parser({plugins: ['plugins/commentsOnly']}))
        .pipe(jsdoc.generator('doc'));
});
gulp.task('watch', [ 'jscs', 'mocha', 'esdoc' ], function() {
    gulp.watch([ src, testSrc, '../gh-pages-angie/**' ], [ 'mocha', 'esdoc' ]);
});
gulp.task('watch:mocha', [ 'jscs', 'mocha' ], function() {
    gulp.watch([ src, testSrc, '../gh-pages-angie/**' ], [ 'mocha' ]);
});
gulp.task('watch:esdoc', [ 'esdoc' ], function() {
    gulp.watch([ src, '../gh-pages-angie/**' ], [ 'esdoc' ]);
});
gulp.task('default', [ 'jscs', 'mocha', 'esdoc' ]);
