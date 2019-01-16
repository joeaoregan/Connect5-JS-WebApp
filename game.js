/*
	Joe O'Regan
	game.js
	Connect 5
	5 in a row game with client side logic
*/
var socket = io();

const CONNECT = 5;
const ROWS = 6;
const COLS = 9;
const PLAYER_1 = 1;
const PLAYER_2 = 2;

var currentPlayer;
var fiveInARow;
var ready;
var gameOver;
var board = [[0,0,0,0,0,0,0,0,0],	// init board
			 [0,0,0,0,0,0,0,0,0],
			 [0,0,0,0,0,0,0,0,0],
			 [0,0,0,0,0,0,0,0,0],
			 [0,0,0,0,0,0,0,0,0],
			 [0,0,0,0,0,0,0,0,0]];			
var winBoard;

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

var cols = [col0, col1, col2, col3, col4, col5, col6, col7, col8];

if (columns && !gameOver) {
	for (var i = 0; i < columns.length; i++) {
		columns[i].addEventListener('click', turnClick, false);
	}	
}

startGame();	// Start the game

function startGame() {
	console.log('\x1b[36mStart Game!!!');
	currentPlayer = PLAYER_1
	ready = false;
	gameOver = false; 
	resetBoard(board);					// Reset: clears the board
	winBoard = board;					// Reset: clears previous winning position
	drawBoard();						// Reset: Draw the reset board
	displayCurrentPlayer();				// Reset: Clear the win message
}

function turnClick(col) {
	if (!gameOver) {
		console.log('Player %d column selected: %s', currentPlayer, col.currentTarget.id);
		turn(col.currentTarget.id, currentPlayer);
	}
}

function turn(colID, player) {
	checkCol(colID);
	drawBoard();
}

function drawBoard() {	 
	for (var row = 0; row < ROWS; row++) {
		for (var col = 0; col < COLS; col++) {	
			if (board[row][col] === 0)
				cols[col][row].style.backgroundImage="linear-gradient(to bottom right, white, grey))";	// empty		
			else if (board[row][col] == 1)
				cols[col][row].style.backgroundImage="linear-gradient(to bottom right, red, darkred)";	// player 1
			else if (board[row][col] == 2)
				cols[col][row].style.backgroundImage="linear-gradient(to bottom right, yellow, orange)";// player 2
			else if (board[row][col] == 3)
				cols[col][row].style.backgroundImage="linear-gradient(to bottom right, lime, green)";	// winning line
		}
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
		console.log('\x1b[32mPlayer %d is the winner!', player);
		document.getElementById("player_info").innerText = (currentPlayer==PLAYER_1) ? "Player 1 Is The Winner!!!" : "Player 2 Is The Winner!!!";
		document.getElementById("player_info").style.color = (currentPlayer==PLAYER_1) ? "red" : "orange";
		show5InARow();
	}
}

function checkCol(col) {
	if (board[0][col] !== 0) {
		console.log('\x1b[31mError:\x1b[0m Column %s is full!', col);
	} else {	
		for (var i = ROWS-1; i >= 0; i--) {
			if (board[i][col] === 0) {
				board[i][col] = currentPlayer;
				break;
			}
		}	
		
		checkWin(currentPlayer);
		
		if (!gameOver) {
			changePlayer();	// Move complete, change the active player
		}
	}
}

function changePlayer() {
	currentPlayer = (currentPlayer == PLAYER_1) ? PLAYER_2 : PLAYER_1;
	displayCurrentPlayer();
}

function displayCurrentPlayer() {
	document.getElementById("player_info").innerText = (currentPlayer==PLAYER_1) ? "Player 1 Go" : "Player 2 Go";
	document.getElementById("player_info").style.color = (currentPlayer==PLAYER_1) ? "red" : "orange";
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

function resetBoard(board) {
	for (var row = 0; row < ROWS; row++) {
		for (var col = 0; col < COLS; col++) {
			board[row][col] = 0;			
			cols[col][row].style.backgroundImage="";	// Reset coloured cells
		}
	}
}