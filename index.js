/*
	Joe O'Regan
	index.js
*/
/*
//const http = require('http');
const socketIO = require('socket.io');
//const server = http.Server(app).listen(port);
const io = socketIO(server);
*/
const port = process.env.PORT || 1337; // PORT NUMBER
const express = require('express'); // OK
const path = require('path'); // OK
const app = express(); // OK
const server = require('http').Server(app).listen(port);	//var server = app.listen(port);
const io = require('socket.io').listen(server);

const CONNECT = 5, ROWS = 6, COLS = 9;
const PLAYER_1 = 1, PLAYER_2 = 2;

var games = 0;
var currentPlayer = PLAYER_1;
var fiveInARow;
var gameOver;

var board = [[0,0,0,0,0,0,0,0,0],	// init board
			 [0,0,0,0,0,0,0,0,0],
			 [0,0,0,0,0,0,0,0,0],
			 [0,0,0,0,0,0,0,0,0],
			 [0,0,0,0,0,0,0,0,0],
			 [0,0,0,0,0,0,0,0,0]];			
var winBoard = board;	

displayBoard(board);
console.log("Server running at http://localhost:%d", port);

app.set('port', port);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, 'index.html'));	
});

app.get('/style.css', function(req, res) {
	res.sendFile(__dirname + "/static/" + "style.css");
});

app.get('/favicon.ico', function(req, res) {
	res.sendFile(__dirname + "/static/" + "favicon.ico");
});

io.on('connection', (socket) => {
	console.log("New Connection");
		
    // Create a new game and notify player
    socket.on('create', (data) => {
        socket.join(`game-${++games}`);	// subscribe to a specific channel (game), join a room
        socket.emit('newGame', { username: data.username, gameID: `game-${games}` });
		console.log('Game-'+games+' created by player 1: '+data.username+'. Waiting on Player 2');
    });
	
	socket.on('col', (data) => {		
		if (data.player === currentPlayer) {
			checkCol(data.column);
			checkWin(data.player);					
			changePlayer(); 	// Move complete, change the active player
			
			// sockets join a room, makes it easier to to broadcast messages to other sockets
			//socket.emit('turnPlayed', {
			//socket.broadcast.to(data.gameID).emit('turnPlayed', { 														// UPDATES OPPOSITE PLAYER
			//socket.broadcast.to(data.gameID).emit('gameEnd', data);
			io.to(data.gameID).emit((gameOver) ? 'gameOver' : 'turnPlayed', {
				board: board,
				column: data.column,
				gameID: data.gameID,						// data.gameID = room
				player: currentPlayer
			});
			
		} else {
			console.log("Not Your Turn Player %s!", data.player);
		}	
	});
	
    // Connect the Player 2 to the room he requested. Show error if room full.
    socket.on('player2join', function (data) {
		console.log("player2join: Player 2: " + data.username + " has joined " + data.gameID);		
		currentPlayer = PLAYER_1;		
        var game = io.nsps['/'].adapter.rooms[data.gameID];
		
        if (game && game.length === 1) {
            socket.join(data.gameID);			
            socket.broadcast.to(data.gameID).emit('player1', {});				
			
            socket.emit('player2', { username: data.username, gameID: data.gameID });										// UPDATES OPPOSITE PLAYER
			//io.to(data.gameID).emit('player2', { username: data.username, gameID: data.gameID });			
        } else {
            socket.emit('err', { message: 'This game is already full' });
        }
    });

    // Broadcast game winner
    socket.on('gameOver', (data) => {
        socket.broadcast.to(data.gameID).emit('gameEnd', data);
		//io.to(data.gameID).emit('gameEnd',  data);
    });
	
	socket.on('disconnect', function() {
		console.log('Player  has disconnected');
	});
});

function checkCol(col) {
	console.log('Check column '+col+' for Player' + currentPlayer);	
	if (board[0][col] != 0) {
		console.log('\x1b[31mError:\x1b[0m Column %s is full!', col);
	} else {	
		for (var i = ROWS-1; i >= 0; i--) {
			if (board[i][col] == 0) {
				board[i][col] = currentPlayer;
				break;
			}
		}			
		displayBoard(board);
	}
}

function checkWin(player) {
	// Diagonals
	var win = false;
	
	for (var row = 0; row <= ROWS - CONNECT; row++) {
		// up to right
		for (var col = CONNECT-1; col < COLS; col++) {
			if (board[row][col] == player && board[row + 1][col - 1] == player && board[row + 2][col - 2] == player
					&& board[row + 3][col - 3] == player && board[row + 4][col - 4] == player) {
				win = true;
				fiveInARow = [row,col,row+1,col-1,row+2,col-2,row+3,col-3,row+4,col-4]; // Highlight winning move
				break;
			}
		}
		
		// up to left
		if (!win) {
			for (var col = 0; col <= COLS - CONNECT; col++) {
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
	for (var row = 0; row < ROWS; row++) {
		for (var col = 0; col <= COLS - CONNECT; col++) {
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
	for (var row = 0; row <= ROWS - CONNECT; row++) {
		for (var col = 0; col < COLS; col++) {
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
		highlightWinner(player);
	}
}

function displayBoard(board) {
	console.log('\n  \x1b[36m%s\x1b[0m %s', 'Connect5', 'by Joe O\'Regan');  //cyan
	console.log('\x1b[34m_\x1b[0m1\x1b[34m__\x1b[0m2\x1b[34m__\x1b[0m3\x1b[34m__\x1b[0m4\x1b[34m__\x1b[0m5\x1b[34m__\x1b[0m6\x1b[34m__\x1b[0m7\x1b[34m__\x1b[0m8\x1b[34m__\x1b[0m9\x1b[34m_');
	for (var i = 0; i < ROWS; i++) { // display 0 to 5
		for (var j = 0; j < 9; j++) {
			process.stdout.write((board[i][j] === 0) ? '[\x1b[34m ]' : (board[i][j] == 1) ? '[\x1b[31mO\x1b[34m]' : (board[i][j] == 2) ? '[\x1b[33mO\x1b[34m]' : '[\x1b[32mO\x1b[34m]');
		}
		process.stdout.write('\n');
	}	
	console.log("=".repeat(27));
	console.log('|        \x1b[36mCONNECT 5\x1b[34m        |');
	console.log("=".repeat(27)+"\x1b[0m");
}

// Highlight the winning row
function highlightWinner(player) {
	console.log("\n\x1b[32m"+"*".repeat(27) + '\n* Player '+player+' is the winner! *\n' + "*".repeat(27)+ "\x1b[0m");
	winBoard = board;
	for (var i = 0; i < (CONNECT*2); i += 2) {
		winBoard[fiveInARow[i]][fiveInARow[i + 1]] = 3; // Highlight winning line
	}
	displayBoard(winBoard);
}

function changePlayer() {	
	currentPlayer = (currentPlayer == PLAYER_1 && !gameOver) ? PLAYER_2 : PLAYER_1;	// If the game is not over change the current player, otherwise leave as is for winner message
}