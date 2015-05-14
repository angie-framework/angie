'use strict';

require('babel/register');

const gulp =        require('gulp'),
      eslint =      require('gulp-eslint'),
      istanbul =    require('gulp-istanbul'),
      isparta =     require('isparta'),
      mocha =       require('gulp-mocha'),
      babel =       require('gulp-babel'),
      jsdoc =       require('gulp-jsdoc');

const src = 'src/**/*.es6',
      testSrc = 'test/**/*.spec.es6',
      coverageSrc = 'coverage',
      docSrc = 'doc';

gulp.task('eslint', function () {
    return gulp.src(src).pipe(
        eslint()
    ).pipe(
        eslint.format()
    ).pipe(
        eslint.failOnError()
    );
});
gulp.task('mocha', [ 'eslint' ], function(cb) {
    gulp.src([ src ]).pipe(
        istanbul({
            instrumenter: isparta.Instrumenter,
            instrumenterOptions: {
                isparta: {
                    experimental: true
                }
            },
            includeUntested: true
        })
    ).pipe(
        istanbul.hookRequire()
    ).on('finish', function() {
        gulp.src([ testSrc ], {
            read: false
        }).pipe(mocha({
            reporter: 'nyan'
        })).pipe(
            istanbul.writeReports()
        ).on('end', cb);
    });
});
gulp.task('jsdoc', [ 'mocha' ], function() {
    gulp.src(src).pipe(
        babel()
    ).pipe(
        jsdoc.parser()
    ).pipe(
        jsdoc.generator(docSrc)
    );
});
gulp.task('watch:mocha', [ 'mocha' ], function() {
    gulp.watch([ src, testSrc ], [ 'mocha' ]);
});
gulp.task('default', [ 'jsdoc' ]);
