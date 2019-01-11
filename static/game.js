var socket = io();
socket.on('message', function(data) {
  console.log(data);
});

// Keyboard states
var movement = {
	up: false,
	down: false,
	left: false,
	right: false
}
				
document.addEventListener('keydown', function(event) {
	switch (event.keyCode) {
		case 65: // A
		case 37: // Left
		case 100: // 4
			movement.left = true;
			break;
		case 87: // W
		case 38: // Up
		case 104: // 8
			movement.up = true;
			break;
		case 68: // D
		case 39: // Right
		case 102: // 6
			movement.right = true;
			break;
		case 83: // S
		case 40: // Down
		case 98: // 2
			movement.down = true;
			break;
	}
});

document.addEventListener('keyup', function(event) {
	switch (event.keyCode) {
		case 65: // A
		case 37: // Left
		case 100: // 4
			movement.left = false;
			break;
		case 87: // W
		case 38: // Up
		case 104: // 8
			movement.up = false;
			break;
		case 68: // D
		case 39: // Right
		case 102: // 6
			movement.right = false;
			break;
		case 83: // S
		case 40: // Down
		case 98: // 2
			movement.down = false;
			break;
	}
});
		
// Alert server that a new player has joined
socket.emit('new player');

setInterval(function() {
	socket.emit('movement', movement);
}, 1000 / 60);
		
		
// Handler to draw data on the Server to the HTML5 canvas
// Access canvas and draw to it
var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;

var context = canvas.getContext('2d');
socket.on('state', function(players) {
	context.clearRect(0, 0, 800, 600);
	context.fillStyle = 'green';
	
	for (var id in players) {
		var player = players[id];
		context.beginPath();
		context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
		context.fill();
	}
});