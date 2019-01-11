// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

var game = require('./var');	// require from same directory (only works for server)

//console.log('width %d height %d radius %d', game.WIDTH, game.HEIGHT, game.PLAYER_RADIUS);

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

// Starts the server.
server.listen(5000, function() {
  console.log('Starting server on port 5000');
});

//// For testing
//setInterval(function() {
//	  io.sockets.emit('message', 'hi!');
//	}, 1000);

// Handle Client Keyboard State 60 times a second
var players = {};
io.on('connection', function(socket) {	
	socket.on('new player', function() {
		console.log("New player connected. Socket ID: %s", socket.id);
		players[socket.id] = {
			x: 300,
			y: 300
		};
	});

	socket.on('movement', function(data) {
		var player = players[socket.id] || {};
		
		if (data.left) {
			if (player.x > (game.PLAYER_RADIUS / 2))
				player.x -= 5;
		} else if (data.right) {
			if (player.x < (game.WIDTH - (game.PLAYER_RADIUS / 2)))
				player.x += 5;
		}
		
		if (data.up) {
			if (player.y > (game.PLAYER_RADIUS / 2))
				player.y -= 5;
		} else if (data.down) {
			if (player.y < (game.HEIGHT - (game.PLAYER_RADIUS / 2)))
			player.y += 5;
		}
	});
	
	socket.on('disconnect', function() {
		console.log('Player with socket ID: %s has disconnected', socket.id);	
	});
});

setInterval(function() {
  io.sockets.emit('state', players);
}, 1000 / 60);