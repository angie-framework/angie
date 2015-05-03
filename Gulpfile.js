'use strict';

import server from './src/Server';

const gulp =        require('gulp');

const p = process;

let args;

gulp.task('server', function() {
    return server(args);
});

gulp.task('reload', [ 'server' ], function() {
    console.log('watch called');
    console.log(p.cwd());
    gulp.watch([ 'src/*', `${p.cwd()}/*` ], //function() {
    //     gulp.run('server');
    // });
    [ 'server' ]);
});

export default function gulpServer() {
    args = arguments[0];
    gulp.start('reload');
};
