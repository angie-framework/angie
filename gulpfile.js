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

// There are no really good solutions to es6 documentation. I'm using the name.
// TODO export this to doc generation module
gulp.task('jsdoc', function() {
    try {
        fs.mkdirSync(docSrc);
    } catch(e) {
        onErr(e);
    }
    exec(`rm -rf ${docSrc}/*`, function() {
        getDirDocstrings('src', '');
    });
});
gulp.task('watch:mocha', [ 'mocha' ], function() {
    gulp.watch([ src, testSrc ], [ 'mocha' ]);
});
gulp.task('watch:jsdoc', [ 'jsdoc' ], function() {
    gulp.watch([ src ], [ 'jsdoc' ]);
});
gulp.task('default', [ 'mocha' ]);


// TODO don't bother checking for errors at the moment, but later parse the docstring
function getDirDocstrings(path, file) {
    let filepath = `${path}/${file}`,
        docFilepath = `${docSrc}/${filepath}`;

    // TODO benchmark this against the way you check for double slashes in the
    // request
    filepath = filepath.replace('//', '/');
    docFilepath = docFilepath.replace('//', '/');

    if (filepath.indexOf('.') > -1) {
        let content = fs.readFileSync(filepath, 'utf8'),
            docstrings = content.match(/[^\S\r\n]*\/(?:\*{2})([\W\w]+?)\*\//g) || [];

        if (docstrings && docstrings.length) {
            fs.writeFileSync(
                docFilepath.replace('.', '.doc.'),
                docstrings.join('\r\n').replace(/\s{2,}/g, '\n')
            );
        }
    } else {
        fs.mkdirSync(docFilepath);

        let files = fs.readdirSync(filepath);
        files.forEach(function(file) {
            getDirDocstrings(filepath, file);
        });
    }
}

function onErr(e) {
    console.error(e);
}
