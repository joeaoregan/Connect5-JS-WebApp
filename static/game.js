/*
	Joe O'Regan
	game.js
	Connect 5 - Multiplayer
*/
const socket = io();
const ROWS = 6, COLS = 9;
const PLAYER_1 = 1, PLAYER_2 = 2;

var board = Array(6).fill().map(() => Array(9).fill(0));			
var winBoard;
var player, game;

const columns = document.querySelectorAll('.column');
var cols=[];
for (var i = 0; i < 9; i++) {
	cols[i] = document.querySelectorAll('.col'+i);	// Used to draw the disks
}
document.querySelector('#newGameBtn').addEventListener('click', username1Button, false);
document.querySelector('#existingBtn').addEventListener('click', username2Button, false);

class Player {
	constructor(name, type) {
		this.name = name;			// Players name
		//this.opponent = "";			// Opponents name
		this.type = type;
		this.turn = false;
	}
}

class Game {
	constructor(gameID) {
		//this.readyToPlay = false;
		this.gameID = gameID;
		this.board = board;	
		this.winBoard = board;
		this.gameOver = false;	
		this.currentPlayer = 0;
	}
	
	getCurrentPlayer() {return this.currentPlayer; }
	setCurrentPlayer(player) { this.currentPlayer=player; }
	getGameID() { return this.gameID; }
	setReadyToPlay(ready) { this.readyToPlay = ready; }
	setGameOver(gameOver) { this.gameOver=gameOver; }
	getBoard() { return this.board; }
	
	setup(gameID) {
		//this.readyToPlay = false;
		this.gameID = gameID;
		this.board = Array(ROWS).fill().map(() => Array(COLS).fill(0));	
		this.winBoard = board;
		this.gameOver = false;	
		this.currentPlayer = PLAYER_1;
	}
	
	//init(gameID, username) {
	init() {
		//this.showGame({name: username, gameID: gameID});
		//this.showGame({name: username, gameID: this.gameID});
		//this.currentPlayer = 0;
		//this.board = board;
		//board = Array(6).fill().map(() => Array(9).fill(0));
		console.log('\x1b[36mStart Game!!! ' + this.gameID);
		this.drawBoard(this.board);													// Reset: Draw the reset board
				
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
			this.drawBoard(this.board);			
			player.turn = false;		
			console.log('Your Turn - column: ' + colID);
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
		document.getElementById("username").innerText = "Player " + player.type + ": " + player.name;
		
		if (!this.currentPlayer == PLAYER_1) {
			document.getElementById("displayMessage").innerText = "Welcome "+ player.name + ". Player 2 must enter Game ID: \"" + data.gameID + "\" to join";
		} else {
			//document.getElementById("displayMessage").innerText = "Welcome "+ player.name + ", now playing " + data.name;	////////////////////////////////////////////////// NEED TO GET PLAYER 1 NAME HERE
			document.getElementById("displayMessage").innerText = "Welcome "+ player.name;	////////////////////////////////////////////////// NEED TO GET PLAYER 1 NAME HERE
		}
	}
	
	addMessage(data) {
		document.getElementById("player_info").innerText = data.message;
		document.getElementById("player_info").style.color = data.colour;
	}
}
	
socket.on('newGame', (data) => {
	game = new Game(data.gameID);
	game.init();
	game.showGame({name: data.username, gameID: data.gameID});
});

socket.on('player1', (data) => {
	console.log('Player 1 Init');
	game.setCurrentPlayer(PLAYER_1);
	game.drawBoard(game.getBoard());
});

// Create game for player 2
socket.on('player2', (data) => {
	console.log('Player 2 Init');
	game = new Game(data.gameID);
	game.init();
	game.setCurrentPlayer(PLAYER_1);
	game.showGame({name: data.username, gameID: data.gameID});
	game.drawBoard(game.getBoard());
});

socket.on('turnPlayed', (data) => {
	console.log('turn played & board updated');	
	game.board = data.board;
	game.setCurrentPlayer(data.player);
	game.drawBoard(data.board);
	console.log('Current Player Now: ' + data.player);
	if (player.type == game.currentPlayer)
		document.getElementById("column-" + String(data.column)).style.backgroundColor = (player.type == PLAYER_1) ? "yellow" : "red";
	game.drawBoard(data.board);
	player.turn = true;
});






socket.on('gameWon', (data) => {
	console.log('Game Finished');
	game.setGameOver(true);		
	game.board = data.board;
	//game.setCurrentPlayer(data.player);	
	game.drawBoard(data.board);
	//socket.leave(data.room);
	//game.init();
	//game.setup(data.gameID);
});






socket.on('shutdownMsg', (data) => {
	var waitTime = 5000; // 5 seconds
	var currentTime = 0;
	var waitInterval = 1000;
	
	game.addMessage({message: 'Player: '+ data.player + ' has abandoned us!!! Restarting in ' +(waitTime - currentTime)/1000 + ' seconds', colour: 'red'});
	
	var interval = setInterval(function() {	
	currentTime += waitInterval;	
		//process.stdout.clearLine();
		//process.stdout.cursorTo(0);
		//process.stdout.write(`waiting ${(waitTime - currentTime)/1000} seconds...`);
		
		game.addMessage({message: 'Player: '+ data.player + ' has abandoned us!!! Restarting in ' + (waitTime - currentTime)/1000+ ' seconds', colour: 'red'});
			
		if (currentTime >= waitTime)
			leaveGameButton();
	}, waitInterval);


	setTimeout(function() {
		clearInterval(interval); // clear interval from running (to exit app)
		//console.log("\ndone");
	}, waitTime);
	
	
	//game.addMessage({message: 'Player: '+ data.player + ' has abandoned us!!! Restarting in ' + + ' seconds', colour: 'red'});
	
});


socket.on('clearBoard', (data) => {
	resetGame();  // LOOP
	game.drawBoard(game.getBoard());
	game.addMessage({message: 'Game Reset By '+ data.player + '!!! Player 1 To Restart', colour: 'blue'});
});



function handleClicks(col) {
	clearColumnBG();
	if (!game.gameOver && player.type == game.currentPlayer) {
		//console.log('Player %d column selected: %s', currentPlayer, col.currentTarget.id);
		//game.turn(col.currentTarget.id);	
		//socket.emit('col', {column : col.currentTarget.id, player: player.type, gameID: game.getGameID()})
		var columnSelected = parseInt(col.currentTarget.id.split('-')[1]);
		game.turn(columnSelected);
		socket.emit('col', {column : columnSelected, player: player.type, gameID: game.getGameID()})		
	} else if (game.getCurrentPlayer() !== 0) {
		game.addMessage({message: 'Player '+((player.type == PLAYER_1) ? PLAYER_2 : PLAYER_1)+' Go. Please Wait For Your Turn!', colour: ((player.type == PLAYER_1) ? 'red' : 'orange')});
	} else {
		game.addMessage({message: 'Please Wait For Your Turn!', colour: ((player.type == PLAYER_1) ? 'red' : 'orange')});
	}
}

function clearColumnBG() {
	for (var i = 0; i < 9; i++) {
		document.getElementById("column-" + String(i)).style.backgroundColor = "blue";
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
	game.init();
}




/*
	When reset button is pressed
*/
function resetGame() {
	console.log('*** GAME RESET ***');
	for (var row = 0; row < ROWS; row++) {
		for (var col = 0; col < COLS; col++) {
			game.board[row][col] = 0;			
			cols[col][row].style.backgroundImage="";	// Reset coloured cells
		}
	}
	
	board = Array(6).fill().map(() => Array(9).fill(0));
		
	game.init();
	game.setup(game.gameID);
	
	game.drawBoard(game.getBoard());
}

function resetGameButton() {
	resetGame();
	socket.emit('resetGame', {player: player.name, gameID: game.getGameID()});
}




function leaveGameButton() {
	//var pl = player.name;
	//var gID = game.getGameID();
	socket.emit('leaveGame', {player: player.name, gameID: game.getGameID()});
	location.reload();
	//console.log('name: '+pl+' Game ID: '+gID);
}