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

socket.on('board', function(board) {
	displayBoard(board);
}

socket.on('disconnect', function() {
  console.log('Connection to server has been terminated');
});




function displayBoard(board) {
	console.log();
	if (!ready) {
		console.log('  \x1b[36m%s\x1b[0m %s', 'Connect5', 'by Joe O\'Regan');  //cyan
	}

	var redO = "\x1b[31mO";
	var yellowO = "\x1b[33mO";
	var emptyCol = "\x1b[34m ";
	var greenO = "\x1b[32mO";

	for (var i = 0; i < rows; i++) { // display 0 to 5
		console.log('\x1b[34m[%s\x1b[34m][\x1b[0m%s\x1b[34m][%s\x1b[34m][%s\x1b[34m][%s\x1b[34m][%s\x1b[34m][%s\x1b[34m][%s\x1b[34m][%s\x1b[34m]',	
		(board[i][0] == 0) ? emptyCol : (board[i][0] == 1) ? redO : (board[i][0] == 2) ? yellowO : greenO,
		(board[i][1] == 0) ? emptyCol : (board[i][1] == 1) ? redO : (board[i][1] == 2) ? yellowO : greenO,
		(board[i][2] == 0) ? emptyCol : (board[i][2] == 1) ? redO : (board[i][2] == 2) ? yellowO : greenO,
		(board[i][3] == 0) ? emptyCol : (board[i][3] == 1) ? redO : (board[i][3] == 2) ? yellowO : greenO,
		(board[i][4] == 0) ? emptyCol : (board[i][4] == 1) ? redO : (board[i][4] == 2) ? yellowO : greenO,
		(board[i][5] == 0) ? emptyCol : (board[i][5] == 1) ? redO : (board[i][5] == 2) ? yellowO : greenO,
		(board[i][6] == 0) ? emptyCol : (board[i][6] == 1) ? redO : (board[i][6] == 2) ? yellowO : greenO,
		(board[i][7] == 0) ? emptyCol : (board[i][7] == 1) ? redO : (board[i][7] == 2) ? yellowO : greenO,		
		(board[i][8] == 0) ? emptyCol : (board[i][8] == 1) ? redO : (board[i][8] == 2) ? yellowO : greenO);
	}
	
	console.log('===========================');
	console.log((ready) ? '|      \x1b[36mSelect 1 to 9\x1b[34m      |' : '|        \x1b[36mCONNECT 5\x1b[34m        |');
	console.log('===========================\x1b[0m');
}