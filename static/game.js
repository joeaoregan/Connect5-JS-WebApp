/*
	Joe O'Regan
	game.js
	Connect 5
	5 in a row game with client side logic
*/
var socket = io();

//const CONNECT = 5;
const ROWS = 6;
const COLS = 9;
const PLAYER_1 = 1;
const PLAYER_2 = 2;

//var currentPlayer;
//var fiveInARow;
//var ready;
//var gameOver;
var board = [[0,0,0,0,0,0,0,0,0],	// init board
			 [0,0,0,0,0,0,0,0,0],
			 [0,0,0,0,0,0,0,0,0],
			 [0,0,0,0,0,0,0,0,0],
			 [0,0,0,0,0,0,0,0,0],
			 [0,0,0,0,0,0,0,0,0]];			
var winBoard;
var player, game;

const columns = document.querySelectorAll('.column');
const col0 = document.querySelectorAll('.col0');	// IDs of cells in each column
const col1 = document.querySelectorAll('.col1');
const col2 = document.querySelectorAll('.col2');
const col3 = document.querySelectorAll('.col3');
const col4 = document.querySelectorAll('.col4');
const col5 = document.querySelectorAll('.col5');
const col6 = document.querySelectorAll('.col6');
const col7 = document.querySelectorAll('.col7');
const col8 = document.querySelectorAll('.col8');
const cols = [col0, col1, col2, col3, col4, col5, col6, col7, col8];

document.querySelector('#newGameBtn').addEventListener('click', username1Button, false);
document.querySelector('#existingBtn').addEventListener('click', username2Button, false);

class Player {
	constructor(name, type) {
		this.name = name;
		this.type = type;
		this.turn = false;
	}
}
class Game {
	constructor(gameID) {
		this.readyToPlay = false;
		this.gameID = gameID;
		this.board = board;
		this.gameOver = false;		
		this.winBoard = board;
		this.currentPlayer = 0;
	}	
	setCurrentPlayer(player) {
		this.currentPlayer=player;
	}
	getGameID() {
		return this.gameID;
	}
	setReadyToPlay(ready) {
		this.readyToPlay = ready;
	}
	setGameOver(gameOver) {
		this.gameOver=gameOver;
	}
	getBoard() {
		return this.board;
	}
	
	init() {
		//this.readyToPlay = true;
		console.log('\x1b[36mStart Game!!! ' + this.gameID);
		this.drawBoard(this.board);						// Reset: Draw the reset board
				
		if (columns && !this.gameOver) {
			for (var i = 0; i < columns.length; i++) {
				columns[i].addEventListener('click', handleClicks, false);
			}	
		}
	}	
	
	turn(colID) {
		if (player.type == this.currentPlayer){		
			if (player.turn) {
				socket.emit('takeTurn', {
					column: colID,
					gameID: this.gameID
				});
			}
			
			console.log('draw board after taking go');
			//this.drawBoard(game.board);
			this.drawBoard(this.board);
			
			player.turn = false;
		
			console.log('Your Turn - column: ' + colID);
		} else {
			console.log('Not Your Turn Yet - column: ' + colID);
		}
	}
	
	drawBoard(board) {	 
		for (var row = 0; row < ROWS; row++) {
			for (var col = 0; col < COLS; col++) {	
				if (board[row][col] == 0)
					cols[col][row].style.backgroundImage="linear-gradient(to bottom right, white, grey))";	// empty		
				else if (board[row][col] == 1)
					cols[col][row].style.backgroundImage="linear-gradient(to bottom right, red, darkred)";	// player 1
				else if (board[row][col] == 2)
					cols[col][row].style.backgroundImage="linear-gradient(to bottom right, yellow, orange)";// player 2
				else if (board[row][col] == 3)
					cols[col][row].style.backgroundImage="linear-gradient(to bottom right, lime, green)";	// winning line
			}
		}
		
		if (!this.gameOver) {
			document.getElementById("player_info").innerText = (this.currentPlayer === 0) ? "Waiting on Player 2 to join" : (this.currentPlayer==PLAYER_1) ? "Player 1 Go" : "Player 2 Go";
		} else {
			document.getElementById("player_info").innerText = "Player "+this.currentPlayer+" Is The Winner!";
		}
		document.getElementById("player_info").style.color = (this.currentPlayer==PLAYER_1) ? "red" : "orange";
	}

	showGame(data) {
		document.getElementById("selectGame").style.display = "none";
		document.getElementById("gameBoard").style.display = "inline";	
		document.getElementById("gameBoard").style.display = "inline";	
		document.getElementById("username").innerText = "Player " + player.type + ": " + player.name;
		
		//if (!this.readyToPlay) {
		if (!this.currentPlayer == PLAYER_1) {
			document.getElementById("displayMessage").innerText = "Welcome "+ player.name + ". Player 2 must enter Game ID: \"" + data.gameID + "\" to join";
		} else {
			document.getElementById("displayMessage").innerText = "Welcome "+ player.name + ", now playing " + data.name;	////////////////////////////////////////////////// NEED TO GET PLAYER 1 NAME HERE
		}
	}
}
	
socket.on('newGame', (data) => {
	game = new Game(data.gameID);
	game.init();
	game.showGame({name: data.username, gameID: data.gameID});
});

socket.on('player1', (data) => {
	console.log('Player 1 Init');
	game.currentPlayer = PLAYER_1;
	game.drawBoard(game.getBoard());
	//const message = `Hello, ${player.getPlayerName()}`;
	//$('#userHello').html(message);
});

// Create game for player 2
socket.on('player2', (data) => {
	console.log('Player 2 Init');
    game = new Game(data.gameID);
	game.setCurrentPlayer(PLAYER_1);
	game.init();
	game.showGame({name: data.username, gameID: data.gameID});
});

socket.on('turnPlayed', (data) => {
	console.log('turn played & board updated');	
	//console.log("Game Board:\n", data.board);
	game.board = data.board;
	game.setCurrentPlayer(data.player);											// SET THE CURRENT PLAYER BEFORE DRAWING THE BOARD
	game.drawBoard(data.board);
	console.log('Current Player Now: ' + data.player);
	player.turn = true;
});

// If the other player wins, this event is received. Notify user game has ended.
socket.on('gameOver', (data) => {
	console.log('Game Finished');
	game.setGameOver(true);
	
	
	game.board = data.board;
	game.setCurrentPlayer(data.player);	
	game.drawBoard(data.board);
	//game.endGame(data.message);
	//socket.leave(data.room);	
});


function handleClicks(col) {
	if (!game.gameOver && player.type == game.currentPlayer) {
		//console.log('Player %d column selected: %s', currentPlayer, col.currentTarget.id);
		//turn(col.currentTarget.id, currentPlayer);	
		game.turn(col.currentTarget.id);	
		
		//socket.emit('col', {column : col.currentTarget.id, player: currentPlayer})
		socket.emit('col', {column : col.currentTarget.id, player: player.type, gameID: game.getGameID()})
	}
}

function username1Button() {
	var username1 = document.getElementById("username1").value;
	
	if (!username1) {
	  alert('Please Enter A Username To Play');
	  return;
	}
	
	socket.emit('create', { username: username1 });
	player = new Player(username1, PLAYER_1);
}

function username2Button() {
	var username2 = document.getElementById("username2").value;
	var gameIDField = document.getElementById("gameID").value;
	
	if (!username2 || !gameIDField) {
	  alert('Please Enter BOTH Username And Game ID');
	  return;
	}
	
	//console.log('Client (username2Button) - Username: ' + username2 + ' Game ID: ' + gameIDField);	
	socket.emit('player2join', { username: username2, gameID: gameIDField });
	player = new Player(username2, PLAYER_2);
	//game.setCurrentPlayer(PLAYER_1);
}

function startGame() {
	console.log('Start New Game');
	//socket.emit('newGame', { username: data.username, gameID: `game-${games}` });
	game = new Game(game.gameID);
}