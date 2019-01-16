/*
	Joe O'Regan
	index.js
*/
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');





/*
var url = require('url');

function fullUrl(req) {
  return url.format({
    protocol: req.protocol,
    host: req.get('host'),
    pathname: req.originalUrl
  });
}
*/




var port = process.env.PORT || 1337;

var app = express();

// Detect OS
var osWin = false, osMac = false, osLin = false;

if (process.platform === 'win32') {
	osWin = true;
} else if (process.platform === 'darwin') {
	osMac = true;
} else if (process.platform === 'linux') {
	osLin = true;
} else {
	process.exit();
}

gameTitle();

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

console.log("Server running at http://localhost:%d", port);

app.set('port', port);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname, 'index.html'));
	
	//var testURL = fullUrl(request);
	
	//console.log('host' + testURL.host);
	console.log('Request ' + request.get('host'));
	
});

app.get('/style.css', function(req, res) {
	res.sendFile(__dirname + "/static" + "style.css");
});

io.on('connection', (socket) => {
	console.log("New Connection");
});

// Menu
function gameTitle() {
	process.stdout.write('\u001B[2J\u001B[0;0f')	// Clear screen
	process.stdout.write("Connect 5 ");
	/*
	if (osWin) {
		process.stdout.write('(Windows)\n');
	} else if (osMac) {
		process.stdout.write('(Mac)\n');	
	} else if (osLin) {
		process.stdout.write('(Linux)\n');
	}
	*/
	process.stdout.write((osWin) ? '(Windows)\n' : (osMac) ? ('(Mac)\n') : (osLin) ? ('(Linux)\n') : '\n');
	process.stdout.write("by Joe O'Regan\n\n");
}