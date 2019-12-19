# Connect 5
## Joe O'Regan

5 in a row game using JavaScript and Node.js. [Play Now.](https://connect5-jor.herokuapp.com/)

## Connect 5

![Connect 5](https://raw.githubusercontent.com/joeaoregan/Connect5-JS/master/Screenshots/screenshot1.png "Connect 5")
![Connect 5: Tooltip](https://raw.githubusercontent.com/joeaoregan/Connect5-JS/master/Screenshots/screenshot2tooltip.png "Connect 5: Tooltip")

* Single device and multiplayer / multiple device communication working (See Heroku link).
* Different games can take place at the same time.
* Opponent move is highlighted
* Added chat feature
* Added tooltip to indicate when messages were sent/received

##### Other Versions

* [Connect 5 Java Console](https://github.com/joeaoregan/Java-AppsAndTutorials/tree/master/Connect5/src/jor/con5/text)
* [Connect 5 AWT GUI](https://github.com/joeaoregan/Java-AppsAndTutorials/tree/master/Connect5/src/jor/con5/gui)
* [Connect 5 Python Console](https://github.com/joeaoregan/Python-GamesAndTutorials/tree/master/Connect5-Console)
* [Connect 5 Python PyGame](https://github.com/joeaoregan/Python-GamesAndTutorials/tree/master/Connect5-GUI)

##### Play the game:
* [Heroku Multiplayer (WORKING)](https://connect5-jor.herokuapp.com/)
* [Azure Single Player](http://test2-k00203642.azurewebsites.net/)
* [Azure Multiplayer Link (Need fix socket.io issue)](http://connect5-jor.azurewebsites.net/)

### Instructions

##### Play

* Player 1 creates a game and is assigned a Game ID
* Player 2 enters game ID from Player 1 to join game
* Player 1 goes first
* Winning 5-in-a-row is highlighted when game is won
* Head-to-head scores are kept
* If Player 1 (Host) leaves a room the game returns to start screen for both players
* If Player 2 (Challenger) leaves room, game resets and another player can be invited
* Press reset to reset the game at any time, or restart when game has been won

##### Install

1. Download and unzip project
2. [Install Node.js](https://nodejs.org/en/)
3. Initialise NPM (from root directory type the following commands in command prompt)
```
npm init
npm install --save express socket.io
```
4. Run the server
```
node server.js
```
###### OR
```
npm start
```
5. navigate to [http://localhost:3000](http://localhost:1337) (Server will run on localhost '127.0.0.1' port: 1337)


### Links / References


#### Turn-based game tutorials

Some links I found helpful:

1. [HackerNoon: How to build a Multiplayer Browser Game (Part 1)](https://hackernoon.com/how-to-build-a-multiplayer-browser-game-4a793818c29b)
2. [JavaScript Tic Tac Toe Tutorial](https://www.youtube.com/watch?v=P2TcQ3h0ipQ)
3. [Simple Multiplayer Tic-Tac-Toe Game using Angular, Node.js, and socket.io rooms](http://www.codershood.info/2018/01/07/building-dead-simple-multiplayer-tic-tac-toe-game-using-angular-nodejs-socket-io-rooms-part-1/)

##### Node.js

1. [Node.js Essential Training (LinkedIn Learning)](https://www.linkedin.com/learning/node-js-essential-training/welcome)
2. [NodeSchool](https://nodeschool.io/#workshoppers)
3. [Node.js Download](https://nodejs.org/en/)
4. [w3schools](https://www.w3schools.com/nodejs/)