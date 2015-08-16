import {default as register} from   'babel-core/register';
register({
    only: [ '**/node_modules/angie*/**', '**/src/**' ],
    stage: 0
});

// System Modules
import gulp from                    'gulp';
import {exec} from                  'child_process';
import eslint from                  'gulp-eslint';
import jscs from                    'gulp-jscs';
import istanbul from                'gulp-istanbul';
import {Instrumenter} from          'isparta';
import mocha from                   'gulp-mocha';
import cobertura from               'istanbul-cobertura-badger';

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
    return gulp.src([ src, 'test/**/!(decorators)*.spec.js' ])
        .pipe(jscs({
            fix: true,
            configPath: '.jscsrc',
            esnext: true
        }));
});
gulp.task('mocha', function(cb) {
    let proc;
    new Promise(function(resolve, reject) {
        proc = gulp.src(src).pipe(
            istanbul({
                instrumenter: Instrumenter,
                includeUntested: true
            })
        ).pipe(
            istanbul.hookRequire()
        ).on('finish', function() {
            gulp.src(
                [ 'test/src/testUtil.spec.js', 'test/**/!(*testUtil).spec.js' ],
                { read: false }
            ).pipe(mocha({
                reporter: 'spec'
            }).on('error', function(e) {
                console.error(e);
                reject();
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
    }).then(function() {
        return cobertura('coverage/cobertura-coverage.xml', 'svg', cb);
    });
});
gulp.task('esdoc', function(cb) {
    exec('esdoc -c esdoc.json', cb);
});
gulp.task('watch', [ 'jscs', 'mocha' ], function() {
    gulp.watch([ src, testSrc, '../gh-pages-angie/**' ], [ 'mocha' ]);
});
gulp.task('watch:mocha', [ 'jscs', 'mocha' ], function() {
    gulp.watch([ src, testSrc, '../gh-pages-angie/**' ], [ 'mocha' ]);
});
gulp.task('test', [ 'jscs', 'mocha' ]);
gulp.task('default', [ 'jscs', 'mocha' ]);
