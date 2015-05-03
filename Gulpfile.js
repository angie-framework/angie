(function() {
    'use strict';

    const gulp = require('gulp');

    const p = process

    gulp.task('server', function() {
        require('src/server')();
    });

    gulp.task('reload', [ 'server' ], function() {
        gulp.watch([ 'src/*', `${p.cwd()}/*` ], //function() {
        //     gulp.run('server');
        // });
        [ 'server' ]);
    });

    module.exports = function() {
        gulp.run('reload');
    };
})();
