//var username = "Player 2";

var notifySound = new sound("MessageAlert.mp3");

//var socket = io({transports: ['websocket'], upgrade: false});
var addLi = (message, user) => {		
	//var li = document.createElement('p');
	//li.classList.add('message');
	
	/*
	if (user) {
		li.classList.add('right');
	} else {
		li.classList.add('left');
	}
	*/
	
	var outerMessageDiv = document.createElement('div');
	var newMessageDiv = document.createElement('div');
	
	if (user) {
		outerMessageDiv.classList.add('right-outer');
		newMessageDiv.classList.add('chat');
		newMessageDiv.classList.add('right-inner');
	} else {				
		//console.log('set class left');
		outerMessageDiv.classList.add('left-outer');
		newMessageDiv.classList.add('chat');
		newMessageDiv.classList.add('left-inner');
	} 	
	
	newMessageDiv.appendChild(document.createTextNode(message));
	
	outerMessageDiv.appendChild(newMessageDiv);
	
	
	//li.appendChild(document.createTextNode(message));
	//var list = document.getElementById('msgList');
	//list.insertBefore(li, list.childNodes[0]);
	
	var messageList = document.getElementById('msgList');
	messageList.appendChild(outerMessageDiv);	
	
	//var scrolldiv = document.getElementById("chatdiv");
	var scrolldiv = document.getElementById("msgList");
	scrolldiv.scrollTop = scrolldiv.scrollHeight;
};

// send value from input box
document.getElementById('inputBtn').addEventListener('click', (e) => {
	socket.emit('message', {msg: document.getElementById('messagetext').value, gameID: game.gameID, username: player.name});
	
	addLi(document.getElementById('messagetext').value, true);
	document.getElementById('messagetext').value = "";
});

// Send text when enter key is pressed
document.getElementById("messagetext")
	.addEventListener("keyup", function(event) {
	event.preventDefault();
	if (event.keyCode === 13) {
		document.getElementById("inputBtn").click();
	}
});

socket.on('message', (data) => {
	addLi(data.msg, false);
	notifySound.play();
});

//socket.on('user.events', (message) => addLi(message, false));