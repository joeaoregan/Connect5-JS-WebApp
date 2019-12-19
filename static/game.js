/*
	Joe O'Regan
	game.js
	Connect 5 - Multiplayer
*/
const socket = io();
const ROWS = 6, COLS = 9, PLAYER_1 = 1, PLAYER_2 = 2, WIN = 3;
const badMoveSnd = new sound("audio/BadMove.mp3"); // Sound when not the players turn
const gameOverSnd = new sound("audio/Win.mp3"); // Sound when game won
const columns = document.querySelectorAll('.column');

var board, winBoard, player, game;
var cols = [];
for (var i = 0; i < 9; i++) {
	cols[i] = document.querySelectorAll('.col' + i); // Used to draw the disks
}
document.querySelector('#newGameBtn').addEventListener('click', username1Button, false);
document.querySelector('#existingBtn').addEventListener('click', username2Button, false);

class Player {
	constructor(name, type) {
		this.name = name;		// Players name
		this.opponent = "";		// Opponents name
		this.type = type;		// Player 1 or 2
		this.turn = false;		// Players can only choose a column if it is there turn
	}
}

class Game {
	constructor(gameID) {
		this.gameID = gameID;
		this.currentPlayer = 0;
		this.winner = 0; // Last game winner
		this.played = 0; // number of games played
		this.p1Wins = 0; // Number of games won by player 1
	}

	init(movesFirst) {
		if (movesFirst === 0) {
			this.played = 0; // number of games played
			this.p1Wins = 0; // Number of games won by player 1
		}
		this.finished = false; // The game is not over
		this.currentPlayer = movesFirst;
		this.board = Array(ROWS).fill().map(() => Array(COLS).fill(0)); // Set/Reset the board
		this.winBoard = board;
		clearColumnBG();
		console.log('\x1b[36mStart Game!!! ' + this.gameID);
		this.drawBoard(this.board); // Reset: Draw the reset board

		if (columns && !this.finished) {
			for (var i = 0; i < columns.length; i++) {
				columns[i].addEventListener('click', handleClicks, false);
			}
		}
		hudUpdateWins(); // Display the head to head wins
	}

	turn(colID) {
		if (player.type == this.currentPlayer) {
			if (player.turn) {
				socket.emit('takeTurn', { column: colID, gameID: this.gameID });
				player.turn = false; // console.log('Your Turn - column: ' + colID);
			}
		}
	}

	drawBoard(board) {
		console.log('*** updating board ***')
		for (var row = 0; row < ROWS; row++) {
			for (var col = 0; col < COLS; col++) {
				var diskColour = (board[row][col] == PLAYER_1) ? 'red, darkred' : (board[row][col] == PLAYER_2) ? 'yellow, orange' : (board[row][col] == WIN) ? 'lime, green' : 'white, grey';
				cols[col][row].style.backgroundImage = "linear-gradient(to bottom right, " + diskColour + ")";
			}
		}

		if (!this.finished) {
			var formattedGameID = this.gameID.charAt(0).toUpperCase() + this.gameID.substring(1)
			document.getElementById("player_info").innerText = (this.currentPlayer === 0) ? "Waiting on Player 2 to join \"" + formattedGameID + "\"" :
				(this.currentPlayer == PLAYER_1) ? "Player 1 Go" : "Player 2 Go";
		} else {
			document.getElementById("player_info").innerText = "Player " + this.currentPlayer + " Is The Winner!";
			this.winner = this.currentPlayer;
		}
		document.getElementById("player_info").style.color = (this.currentPlayer == PLAYER_1) ? "red" : "orange";
	}

	showDetails(data) {
		document.getElementById("selectGame").style.display = "none"; // Hide the game start screen
		document.getElementById("gameBoard").style.display = "inline"; // Show the game board
		document.getElementById("hidechat").style.display = "inline"; // Show the chat window
		document.getElementById("show-gameid").innerText = "Game: " + data.gameID;

		if (game.currentPlayer === 0) {
			document.getElementById("username").innerText = "Player " + player.type + ": " + player.name;
		} else {
			this.drawBoard(this.board); // Update info_message
			console.log('player opponent: ' + player.opponent);
			document.getElementById("username").innerText = (player.type == PLAYER_1) ? ("Player 1: " + player.name + " Vs Player 2: " + player.opponent) : ("Player 2: " + player.name + " Vs Player 1: " + player.opponent);
		}

		document.getElementById("displayMessage").innerText = "Welcome " + player.name + ". Your Are Player " + player.type + ((!this.currentPlayer == PLAYER_1) ? ". Player 2 must enter Game ID: \"" + data.gameID + "\" to join" : "");
	}

	addMessage(data) {
		document.getElementById("player_info").innerText = data.message;
		document.getElementById("player_info").style.color = data.colour;
	}
}

function hudUpdateWins() {
	console.log("games played: " + game.played + " p1Wins: " + game.p1Wins)
	document.getElementById("winsID").innerText = "Player 1 " + game.p1Wins + "-" + (game.played - game.p1Wins) + " Player 2";
}

socket.on('newGame', (data) => {
	game = new Game(data.gameID);
	game.init(0); // Init game, but player not ready to take turn until opposite player joins
	game.showDetails({ name: data.username, gameID: data.gameID });
});

socket.on('player1', (data) => {
	game.currentPlayer = PLAYER_1; // Set current player after player 2 joins game
	console.log('game current player: ' + game.currentPlayer)
	player.opponent = data.usernameP2; // Set opponent name // console.log('Player 1 Init');
	player.turn = true;
	game.showDetails({ name: player.name, gameID: game.gameID });
});

// Create game for player 2
socket.on('player2', (data) => {
	game = new Game(data.gameID); // console.log('Player 2 Init');
	game.init(PLAYER_1); // Overwrites initial message in showDetails()
	player.opponent = data.usernameP1; // Set opponent name;
	game.showDetails({ name: data.username, gameID: data.gameID });
});

socket.on('turnPlayed', (data) => {
	game.board = data.board; // console.log('turn played & board updated');
	game.currentPlayer = data.player; // console.log('Current Player Now: ' + data.player);
	if (player.type == game.currentPlayer)
		document.getElementById("column-" + String(data.column)).style.backgroundColor = (player.type == PLAYER_1) ? "yellow" : "red"; // Highlight the opposition players last move
	game.drawBoard(data.board); // Update the game board
	player.turn = true;
});

socket.on('badMove', () => {
	badMoveSnd.play();
});

socket.on('gameWon', (data) => {
	gameOverSnd.play();
	game.finished = true; // console.log('Game Finished');
	game.board = data.board;
	clearColumnBG();
	game.drawBoard(data.board);
});

socket.on('shutdownMsg', (data) => {
	var waitTime = 5000; // 5 seconds
	var currentTime = 0;
	var waitInterval = 1000;

	game.addMessage({ message: 'Player ' + data.playerID + ': ' + data.player + ' has abandoned us!!! Restarting in ' + (waitTime - currentTime) / 1000 + ' seconds', colour: 'red' });

	var interval = setInterval(function () {
		currentTime += waitInterval;
		game.addMessage({ message: 'Player ' + data.playerID + ': ' + data.player + ' has abandoned us!!! Restarting in ' + (waitTime - currentTime) / 1000 + ' seconds', colour: 'red' });

		if (currentTime >= waitTime) {
			if (data.playerID === PLAYER_1) {
				leaveGameButton(); // Quit the game if Player 1 (host) leaves
			} else {
				game.init(0); // Restart game waiting for player 2 (challenger) to connect
			}
		}
	}, waitInterval);

	setTimeout(function () {
		clearInterval(interval); // clear interval from running (to exit app)
	}, waitTime);
});

socket.on('clearBoard', (data) => {
	resetGame();  // LOOP // console.log('*** clearBoard ***')
	game.addMessage({ message: 'Game Reset By ' + data.player + '!!! Player ' + data.winner + ' To Restart', colour: 'blue' });
});

socket.on('updateWins', (data) => {
	game.played = data.gamesFinished; // console.log('*** UPDATE WINS ***')
	game.p1Wins = data.player1wins; // console.log("games completed: "+data.gamesFinished);
	hudUpdateWins(); // Show the wins
});

function handleClicks(col) {
	clearColumnBG();
	if (!game.finished) {
		if (player.type == game.currentPlayer) {
			var columnSelected = parseInt(col.currentTarget.id.split('-')[1]);
			game.turn(columnSelected);
			socket.emit('col', { column: columnSelected, player: player.type, gameID: game.gameID })
		} else if (game.currentPlayer !== 0) {
			game.addMessage({
				message: 'Player ' + ((player.type == PLAYER_1) ? PLAYER_2 : PLAYER_1) +
					' Go. Please Wait For Your Turn!', colour: ((player.type == PLAYER_1) ? 'red' : 'orange')
			});
			badMoveSnd.play();
		} else {
			game.addMessage({ message: 'Please Wait For Player 2 To Connect!', colour: ((player.type == PLAYER_1) ? 'red' : 'orange') });
		}
	}
}

function clearColumnBG() {
	for (var i = 0; i < 9; i++) {
		document.getElementById("column-" + String(i)).style.backgroundColor = "blue";
	}
}

// When reset button is pressed
function resetGame() {
	console.log('*** GAME RESET ***');
	game.init((game.finished) ? game.winner : PLAYER_1); // Game resets, Player 1 makes first move
}

function resetGameButton() {
	console.log('*** resetGameButton() *** winner: ' + game.winner)
	socket.emit('resetGame', { player: player.name, gameID: game.gameID, winner: game.winner });
	resetGame();
}

function username1Button() {
	var username1 = document.getElementById("username1").value;

	if (!username1) {
		alert('Please Enter A Username To Play');
	} else {
		socket.emit('create', { username: username1 });
		player = new Player(username1, PLAYER_1);
	}
}

function username2Button() {
	var username2 = document.getElementById("username2").value;
	var gameIDField = document.getElementById("gameID").value.toLowerCase();

	if (!username2 || !gameIDField) {
		alert('Please Enter BOTH Username And Game ID');
	} else {
		socket.emit('player2join', { username: username2, gameID: gameIDField });
		player = new Player(username2, PLAYER_2);
	}

}

function leaveGameButton() {
	socket.emit('leaveGame', { player: player.name, playerID: player.type, gameID: game.gameID });
	location.reload(true);
}

enterPressed("username1", "newGameBtn");
enterPressed("username2", "existingBtn");
enterPressed("gameID", "existingBtn");

function enterPressed(textField, buttonName) {
	document.getElementById(textField)
		.addEventListener("keyup", function (event) {
			event.preventDefault();
			if (event.keyCode === 13) {
				document.getElementById(buttonName).click();
			}
		});
}

function sound(src) {
	this.sound = document.createElement("audio");
	this.sound.src = src;
	this.sound.setAttribute("preload", "auto");
	this.sound.setAttribute("controls", "none");
	this.sound.style.display = "none";
	document.body.appendChild(this.sound);

	this.play = function () { this.sound.play(); }
	this.stop = function () { this.sound.pause(); }
}