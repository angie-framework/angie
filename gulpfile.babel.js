'use strict'; 'use strong';

const gulp =        require('gulp'),
      exec =        require('child_process').exec,
      eslint =      require('gulp-eslint'),
      istanbul =    require('gulp-istanbul'),
      isparta =     require('isparta'),
      mocha =       require('gulp-mocha'),
      chalk =       require('chalk');

const src = 'src/**/*.js',
      testSrc = 'test/**/*.spec.js',
      docSrc = 'doc';

gulp.task('eslint', function () {
    gulp.src(src).pipe(
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
            instrumenter: isparta.Instrumenter,
            instrumenterOptions: {
                isparta: {
                    experimental: true
                }
            },

            // TODO Once coverage is up, include untested files
            includeUntested: false
        })
    ).pipe(
        istanbul.hookRequire()
    ).on('finish', function() {
        gulp.src(testSrc).pipe(mocha({
            reporter: 'nyan'
        })).pipe(
            istanbul.writeReports()
        ).on('end', cb);
    });
});
gulp.task('esdoc', function(cb) {
    exec('esdoc -c esdoc.json', cb);
});
gulp.task('watch', [ 'eslint', 'mocha', 'esdoc' ], function() {
    gulp.watch([ src, '../gh-pages-angie/**' ], [ 'mocha', 'esdoc' ]);
});
gulp.task('watch:mocha', [ 'eslint', 'mocha' ], function() {
    gulp.watch([ src, '../gh-pages-angie/**' ], [ 'mocha' ]);
});
gulp.task('watch:esdoc', [ 'esdoc' ], function() {
    gulp.watch([ src, '../gh-pages-angie/**' ], [ 'esdoc' ]);
});
gulp.task('default', [ 'eslint', 'mocha', 'esdoc' ]);
