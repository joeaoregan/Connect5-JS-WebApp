/*
	Joe O'Regan
	index.js
*/
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var port = process.env.PORT || 1337;

var app = express();
var server = http.Server(app, function(req, res) {
    console.log(`${req.method} request for ${req.url}`);
	
	if (req.url === "/") {
		fs.readFile("./index.html", "UTF-8", function(err, html) {
			res.writeHead(200, {"Content-Type": "text/html"});
			res.end(html);
		});
		
	} else if (req.url.match(/.css$/)) {
		var cssPath = path.join(__dirname, req.url);
		
		var fileStream = fs.createReadStream(cssPath, "UTF-8");
		
		res.writeHead(200, {"Content-Type": "text/css"});
		
		fileStream.pipe(res);	// stream contents of file to response
		
	} else {
		res.writeHead(404, {"Content-Type": "text/plain"});
		res.end("404 File Not Found");
	}
}).listen(port);

var io = socketIO(server);


//var server = http.createServer(function(request, response) {
	//response.sendFile(path.join(__dirname, 'index.html'));

//    response.writeHead(200, {"Content-Type": "text/plain"});
//    response.end("Hello from Joe!");
//});


console.log("Server running at http://localhost:%d", port);

app.set('port', port);
app.use('/static', express.static(__dirname + '/static'));


// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/style.css', function(req, res) {
  res.sendFile(__dirname + "/static" + "style.css");
});