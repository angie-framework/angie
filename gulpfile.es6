'use strict';

const gulp =    require('gulp'),
      mocha =   require('gulp-mocha'),
      jsdoc =   require('gulp-jsdoc');

console.log(process.argv);

class gulpTask {
    constructor() {
        this.src = 'src';
        this.testSrc = 'test';
        this.docSrc = 'docs';
    }
    test() {
        gulpTask.mocha();
        gulpTask.jsdoc();
    }
    watch() {

    }
    static mocha() {

    }
    static jsdoc() {
        // return gulp.start(() =>
        //     gulp.src(this.src)
        //         .pipe(jsdoc.parser({ plugins: [ 'plugins/commentsOnly' ] }))
        //         .pipe(jsdoc.generator(this.docSrc))
        // );
    }
}

gulp.start('test', () =>
    new gulpTask().test()
);
gulp.start('watch', function() {
    let _gulpTask = new gulpTask();
    gulp.watch([ _gulpTask.src, _gulpTask.testSrc ], () =>
        _gulpTask.test()
    );
});


// TODO jshint
// TODO jscs

// gulp.task('jsdoc', function() {
//     return gulp.src()
//         .pipe(jsdoc.parser({plugins: ['plugins/commentsOnly']}))
//         .pipe(jsdoc.generator('./doc'));
// });
