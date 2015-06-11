'use strict';

require('babel/register');

const gulp =        require('gulp'),
      exec =        require('child_process').exec,
      fs =          require('fs'),
      eslint =      require('gulp-eslint'),
      istanbul =    require('gulp-istanbul'),
      isparta =     require('isparta'),
      mocha =       require('gulp-mocha'),
      chalk =       require('chalk');

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
gulp.task('esdoc', [ 'mocha' ], function(cb) {
    exec('esdoc -c esdoc.json', cb);
});
gulp.task('watch', [ 'esdoc' ], function() {
    gulp.watch([ src ], [ 'esdoc' ]);
});
gulp.task('default', [ 'esdoc' ]);



function onErr(e) {
    console.error(e);
}
