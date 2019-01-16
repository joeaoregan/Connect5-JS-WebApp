/*
	Joe O'Regan
	index.js
*/
/*
const express = require('express');
//const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const port = process.env.PORT || 1337;
const app = express();
//const server = http.Server(app).listen(port);
const server = require('http').Server(app).listen(port);
const io = socketIO(server);
*/
const port = process.env.PORT || 1337; // PORT NUMBER
const express = require('express'); // OK
const path = require('path'); // OK
const app = express(); // OK
const server = require('http').Server(app).listen(port);
//var server = app.listen(port);
const io = require('socket.io').listen(server);

const CONNECT = 5;
const ROWS = 6;
const COLS = 9;
const PLAYER_1 = 1;
const PLAYER_2 = 2;

var games = 0;
var currentPlayer = PLAYER_1;
var fiveInARow;
var ready;
var gameOver;

var board = [[0,0,0,0,0,0,0,0,0],	// init board
			 [0,0,0,0,0,0,0,0,0],
			 [0,0,0,0,0,0,0,0,0],
			 [0,0,0,0,0,0,0,0,0],
			 [0,0,0,0,0,0,0,0,0],
			 [0,0,0,0,0,0,0,0,0]];			
var winBoard = board;	

console.log("Server running at http://localhost:%d", port);

app.set('port', port);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, 'index.html'));	
	//console.log('Request ' + req.get('host'));	
});

app.get('/style.css', function(req, res) {
	res.sendFile(__dirname + "/static/" + "style.css");
});

app.get('/favicon.ico', function(req, res) {
	res.sendFile(__dirname + "/static/" + "favicon.ico");
});

io.on('connection', (socket) => {
	console.log("New Connection");
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
			
			//console.log('DATA.GAMEID: ', data.gameID); // check gameID received
			//console.log('DATA.GAMEID: ', data.gameID); // check gameID received
		
			// sockets join a room, makes it easier to to broadcast messages to other sockets
			//socket.broadcast.to(data.gameID).emit('turnPlayed', { 														// UPDATES OPPOSITE PLAYER
			io.to(data.gameID).emit('turnPlayed',  { // data.gameID = room
			//socket.emit('turnPlayed', {
				board: board,
				column: data.column,
				gameID: data.gameID,
				player: currentPlayer
			});
			
			if (!gameOver) {
				changePlayer();	// Move complete, change the active player
			}
			
			console.log("column "+data.column+" selected by player " + data.player);
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
            socket.emit('player2', { username: data.username, gameID: data.gameID })			
        } else {
            socket.emit('err', { message: 'This game is already full' });
        }
    });

    // Broadcast game winner
    socket.on('gameOver', (data) => {
        socket.broadcast.to(data.gameID).emit('gameEnd', data);
    });
});



// Game

function checkCol(col) {
	console.log('Checking column for ' + currentPlayer);
	if (board[0][col] != 0) {
		console.log('\x1b[31mError:\x1b[0m Column %s is full!', col);
	} else {	
		for (var i = ROWS-1; i >= 0; i--) {
			if (board[i][col] == 0) {
				board[i][col] = currentPlayer;
				break;
			}
		}	
		
		//checkWin(currentPlayer);
		
		//if (!gameOver) {
		//	changePlayer();	// Move complete, change the active player
		//}
		displayBoard(board);
	}
}


function checkWin(player) {
	console.log("Checking for winner");
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
		console.log('\x1b[32mPlayer %d is the winner!', player);
		show5InARow();
	}
}

function displayBoard(board) {
	console.log();
	console.log('  \x1b[36m%s\x1b[0m %s', 'Connect5', 'by Joe O\'Regan');  //cyan

	var redO = "\x1b[31mO";
	var yellowO = "\x1b[33mO";
	var emptyCol = "\x1b[34m ";
	var greenO = "\x1b[32mO";

	console.log('\x1b[34m_\x1b[0m1\x1b[34m__\x1b[0m2\x1b[34m__\x1b[0m3\x1b[34m__\x1b[0m4\x1b[34m__\x1b[0m5\x1b[34m__\x1b[0m6\x1b[34m__\x1b[0m7\x1b[34m__\x1b[0m8\x1b[34m__\x1b[0m9\x1b[34m_');
	for (var i = 0; i < ROWS; i++) { // display 0 to 5
		console.log('\x1b[34m[%s\x1b[34m][\x1b[0m%s\x1b[34m][%s\x1b[34m][%s\x1b[34m][%s\x1b[34m][%s\x1b[34m][%s\x1b[34m][%s\x1b[34m][%s\x1b[34m]',
		(board[i][0] === 0) ? emptyCol : (board[i][0] == 1) ? redO : (board[i][0] == 2) ? yellowO : greenO,
		(board[i][1] === 0) ? emptyCol : (board[i][1] == 1) ? redO : (board[i][1] == 2) ? yellowO : greenO,
		(board[i][2] === 0) ? emptyCol : (board[i][2] == 1) ? redO : (board[i][2] == 2) ? yellowO : greenO,
		(board[i][3] === 0) ? emptyCol : (board[i][3] == 1) ? redO : (board[i][3] == 2) ? yellowO : greenO,
		(board[i][4] === 0) ? emptyCol : (board[i][4] == 1) ? redO : (board[i][4] == 2) ? yellowO : greenO,
		(board[i][5] === 0) ? emptyCol : (board[i][5] == 1) ? redO : (board[i][5] == 2) ? yellowO : greenO,
		(board[i][6] === 0) ? emptyCol : (board[i][6] == 1) ? redO : (board[i][6] == 2) ? yellowO : greenO,
		(board[i][7] === 0) ? emptyCol : (board[i][7] == 1) ? redO : (board[i][7] == 2) ? yellowO : greenO,		
		(board[i][8] === 0) ? emptyCol : (board[i][8] == 1) ? redO : (board[i][8] == 2) ? yellowO : greenO);
	}
	
	console.log('===========================');
	console.log('|        \x1b[36mCONNECT 5\x1b[34m        |');
	console.log('===========================\x1b[0m');
}

function resetBoard(board) {
	for (var row = 0; row < ROWS; row++) {
		for (var col = 0; col < COLS; col++) {
			board[row][col] = 0;			
			cols[col][row].style.backgroundImage="";	// Reset coloured cells
		}
	}
}

// Highlight the winning row
function show5InARow() {	
	for (var row = 0; row < ROWS; row++) {
		for (var col = 0; col < COLS; col++) {
			winBoard[row][col] = board[row][col];
		}
	}	
	for (var i = 0; i < (CONNECT*2); i += 2) {
		winBoard[fiveInARow[i]][fiveInARow[i + 1]] = 3; // Highlight winning line
	}	
}

function changePlayer() {
	currentPlayer = (currentPlayer == PLAYER_1) ? PLAYER_2 : PLAYER_1;
	//displayCurrentPlayer();
}
