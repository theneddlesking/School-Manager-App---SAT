var http = require('http');

http.createServer(function(request, response ) {
    //Send a header
    //Send status, 200 - success

    response.writeHead(200, {'Content-Type': 'text/plain'});

    //send content

    response.end('Hello world.');

}).listen(8081);


// console to display server only messages
console.log("Server running at http://127.0.0.1:8081");

const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('./chapter1.pdf');

pdf(dataBuffer).then(function(data) {
    // number of pages
    console.log(data.numpages);
    // number of rendered pages
    console.log(data.numrender);
    // PDF info
    console.log(data.info);
    // PDF metadata
    console.log(data.metadata);
    // PDF.js version
    // check https://mozilla.github.io/pdf.js/getting_started/
    console.log(data.version);
    // PDF text
    //console.log(data.text);

    console.log(data);

});
