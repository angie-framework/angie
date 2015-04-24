(function() {
    'use strict';

    const http =      require('http'),
        url =         require('url'),
        path =        require('path');

    const p = process,
        port = p.argv[2] || 9000;

    http.createServer(function(req, res) {

        let uri = url.parse(req.url).pathname;

        // First get the pathname, check and see if a router exists

        //
    }).listen(+port);
})();

//   path.exists(filename, function(exists) {
//     if(!exists) {
//       response.writeHead(404, {"Content-Type": "text/plain"});
//       response.write("404 Not Found\n");
//       response.end();
//       return;
//     }
  //
//     if (fs.statSync(filename).isDirectory()) filename += '/index.html';
  //
//     fs.readFile(filename, "binary", function(err, file) {
//       if(err) {
//         response.writeHead(500, {"Content-Type": "text/plain"});
//         response.write(err + "\n");
//         response.end();
//         return;
//       }
  //
//       response.writeHead(200);
//       response.write(file, "binary");
//       response.end();
//     });
//   });
