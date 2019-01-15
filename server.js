// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

var port = 5000;

var playerCount = 1;
var rows = 6;
var cols = 9;
var gameOver = false;
var ready = false;
var PLAYER_1 = 1;
var PLAYER_2 = 2;
var CONNECT = 5;
var currentPlayer = PLAYER_1;	// Begin the game with Player 1

var board = [[0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0]];
//var winBoard = [[0,0,0,0,0,0,0,0,0],
//				[0,0,0,0,0,0,0,0,0],
//				[0,0,0,0,0,0,0,0,0],
//				[0,0,0,0,0,0,0,0,0],
//				[0,0,0,0,0,0,0,0,0],
//				[0,0,0,0,0,0,0,0,0]];
var winBoard = board;
var fiveInARow;
//console.log(board);

app.set('port', port);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

// Starts the server.
server.listen(port, function() {
  console.log('Starting server on port %d', port);
});

// Test
exampleBoard();
displayBoard(board);	// Show the board
checkWin(currentPlayer);
resetBoard(board);
displayBoard(board);




checkCol(1);
checkWin();
displayBoard(board);

checkCol(3);
checkWin();
displayBoard(board);

checkCol(1);
checkWin();
displayBoard(board);


//// For testing
//setInterval(function() {
//	  io.sockets.emit('message', 'hi!');
//	}, 1000);

// Handle Client Keyboard State 60 times a second
var players = {};

//Add the WebSocket handlers
io.on('connection', function(socket) {
	socket.on('new player', function() {
		console.log('New connection: Player %d', playerCount); // NEW
		players[socket.id] = {
			
			x: 300,		///////////////// remove
			y: 300,		///////////////// remove
			
			id: playerCount++	// assign and increment id
		};
	});

	socket.on('movement', function(data) {
		var player = players[socket.id] || {};
		
		if (data.left) {
			player.x -= 5;
		} else if (data.right) {
			player.x += 5;
		}
		if (data.up) {
			player.y -= 5;
		} else if (data.down) {
			player.y += 5;
		}
	});	
	
	// Player disconnects
	socket.on('disconnect', function() {
		// remove disconnected player
		var player = players[socket.id] || {};		
		console.log('Player %d has disconnected', player.id);
	});
});

setInterval(function() {
  io.sockets.emit('state', players);
}, 1000 / 60);






//io.on('disconnect', function(socket) {
 // console.log('Player disconnected');
//});

//var cyan = "\x1b[36m";		// 		\x1b[36m
//var frameColor = "\x1b[34m"; 	//		\x1b[34m
//var reset = "\x1b[0m";		//		\x1b[0m


// red		\x1b[31m
// yellow	\x1b[33m

function exampleBoard() {
//	board = [[2,1,2,1,2,2,1,2,0],	// 0
//			 [0,2,2,2,1,2,1,1,0],
//			 [0,1,1,0,0,1,2,2,0],
//			 [0,1,0,0,0,0,1,2,0],
//			 [0,0,0,0,0,0,0,1,0],
//			 [0,0,0,0,0,0,0,0,0]];	// 6
			
	board = [[0,0,0,0,0,0,0,0,0],	// 6
			 [0,0,0,0,0,0,0,1,0],
			 [0,1,0,0,0,0,1,2,0],
			 [0,1,1,0,0,1,2,2,0],
			 [0,2,2,2,1,2,1,1,0],
			 [2,1,2,1,2,2,1,2,0]];	// 0
}

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
	//for (var i = rows-1; i >= 0; i--) {	// display 5 to 0
		console.log('\x1b[34m[%s\x1b[34m][\x1b[0m%s\x1b[34m][%s\x1b[34m][%s\x1b[34m][%s\x1b[34m][%s\x1b[34m][%s\x1b[34m][%s\x1b[34m][%s\x1b[34m]',
//		(board[i][0] == 0) ? "\x1b[0m " : (board[i][0] == 1) ? "\x1b[31mO" : "\x1b[33mO",
//		(board[i][1] == 0) ? "\x1b[0m " : (board[i][1] == 1) ? "\x1b[31mO" : "\x1b[33mO",
//		(board[i][2] == 0) ? "\x1b[0m " : (board[i][2] == 1) ? "\x1b[31mO" : "\x1b[33mO",
//		(board[i][3] == 0) ? "\x1b[0m " : (board[i][3] == 1) ? "\x1b[31mO" : "\x1b[33mO",
//		(board[i][4] == 0) ? "\x1b[0m " : (board[i][4] == 1) ? "\x1b[31mO" : "\x1b[33mO",
//		(board[i][5] == 0) ? "\x1b[0m " : (board[i][5] == 1) ? "\x1b[31mO" : "\x1b[33mO",
//		(board[i][6] == 0) ? "\x1b[0m " : (board[i][6] == 1) ? "\x1b[31mO" : "\x1b[33mO",
//		(board[i][7] == 0) ? "\x1b[0m " : (board[i][7] == 1) ? "\x1b[31mO" : "\x1b[33mO",		
//		(board[i][8] == 0) ? "\x1b[0m " : (board[i][8] == 1) ? "\x1b[31mO" : "\x1b[33mO");
		
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

function resetBoard(board) {
	ready = true; ////////////////////////////////////////////////////////////// <<<<<<<    MOVE THIS TO POINT WHEN BOTH PLAYERS CONNECTED
	for (var row = 0; row < rows; row++) {
		for (var col = 0; col < cols; col++) {
			board[row][col] = 0;
		}
	}
}

// Insert a disk for the active player, first checking if there is room in the column
function checkCol(col) {
	if (board[0][col-1] != 0) {
		console.log('\x1b[31mError:\x1b[0m Column %d is full!', col);		
		//currentPlayer = (currentPlayer == PLAYER_1) ? PLAYER_2 : PLAYER_1;	////////////////////// switch players
	}
	
	for (var i = rows-1; i >= 0; i--) {
		if (board[i][col-1] == 0) {
			board[i][col-1] = currentPlayer;
			break;
		}
	}	
	changePlayer();	// Move complete, change the active player
}

function changePlayer() {
	currentPlayer = (currentPlayer == PLAYER_1) ? PLAYER_2 : PLAYER_1;
	console.log('Current Player: Player %d', currentPlayer);
}

function checkWin(player) {
	console.log("Checking winners");
	// Diagonals
	var win = false;
	
	for (var row = 0; row <= rows - CONNECT; row++) {
		// up to right
		for (var col = CONNECT-1; col < cols; col++) {
			if (board[row][col] == player && board[row + 1][col - 1] == player && board[row + 2][col - 2] == player
					&& board[row + 3][col - 3] == player && board[row + 4][col - 4] == player) {
				win = true;
				fiveInARow = [row,col,row+1,col-1,row+2,col-2,row+3,col-3,row+4,col-4]; // Highlight winning move
				break;
			}
		}
		
		// up to left
		if (!win) {
			for (var col = 0; col <= cols - CONNECT; col++) {
				if (board[row][col] == player && board[row + 1][col + 1] == player && board[row + 2][col + 2] == player
						&& board[row + 3][col + 3] == player && board[row + 4][col + 4] == player) {
					win = true;
					fiveInARow = [row,col,row+1,col+1,row+2,col+2,row+3,col+3,row+4,col+4];
					break;
				}
			}
		} else {
			break;
		}
	}

	// Check Rows
	for (var row = 0; row < rows; row++) {
		for (var col = 0; col <= cols - CONNECT; col++) {
			if (board[row][col] == player && board[row][col + 1] == player && board[row][col + 2] == player
					&& board[row][col + 3] == player && board[row][col + 4] == player) {
				win = true;
				fiveInARow = [row,col,row,col+1,row,col+2,row,col+3,row,col+4];
				break;
			}
		}
		if (win) break; // no need for further checks
	}

	// Check Columns
	for (var row = 0; row <= rows - CONNECT; row++) {
		for (var col = 0; col < cols; col++) {
			if (board[row][col] == player && board[row + 1][col] == player && board[row + 2][col] == player
					&& board[row + 3][col] == player && board[row + 4][col] == player) {
				win = true;
				fiveInARow = [row,col,row+1,col,row+2,col,row+3,col,row+4,col];
				break;
			}
		}
		if (win) break; 
	}
	
	if (win) {
		gameOver = true;
		console.log('Player %d is the winner!', player);
		show5InARow();
	}
}

// Highlight the winning row
function show5InARow() {	
	for (var row = 0; row < rows; row++) {
		for (var col = 0; col < cols; col++) {
			winBoard[row][col] = board[row][col];
		}
	}
	
	for (var i = 0; i < (CONNECT*2); i += 2) {
		winBoard[fiveInARow[i]][fiveInARow[i + 1]] = 3; // Highlight winning line
	}
	displayBoard(winBoard);
}