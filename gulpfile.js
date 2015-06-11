'use strict';

require('babel/register');

var gulp =        require('gulp'),
    exec =        require('child_process').exec,
    fs =          require('fs'),
    eslint =      require('gulp-eslint'),
    istanbul =    require('gulp-istanbul'),
    isparta =     require('isparta'),
    mocha =       require('gulp-mocha'),
    chalk =       require('chalk');

var src = 'src/**/*.es6',
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
    exec('esdoc -c esdoc.json', function() {
        var template = fs.readFileSync('doc/index.html', 'utf8');
        console.log(template);
        template = template.replace(
            '</head>',
            '<script type="text/javascript">window.onload = function() { if ' +
            '(parent) { var h = document.getElementsByTagName("head")[0], ' +
            'arrStyleSheets = parent.document.getElementsByTagName("link"); for ' +
            '(var i = 0; i < arrStyleSheets.length; i++) { h.appendChild(' +
            'arrStyleSheets[i].cloneNode(true));}}};</script></head>'
        );
        console.log(template);
        fs.writeFileSync('doc/index.html', template, 'utf8', { 'flags': 'w+' });
    });
});
gulp.task('watch', [ 'esdoc' ], function() {
    gulp.watch([ src ], [ 'esdoc' ]);
});
gulp.task('default', [ 'esdoc' ]);

function onErr(e) {
    console.error(e);
}
