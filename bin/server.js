(function() {
    'use strict';

    require('babel/register');

    // Never ever, ever, ever run processes on Node as root on the servers
    let http =      require('http'),
        connect =   require('connect');

    const port = 8000;

    let app = connect();

    for (let i = 0; i < process.argv.length; ++i) {
        if (!isNaN(+process.argv[i])) {
            port = +process.argv[i];
            break;
        }
    }

    app.use(connect.static(`${__dirname}/../`));

    http.createServer(app).listen(port);
    console.log('Listening on ' + port + '...');
})();

// TODO rewrite this in ES6
