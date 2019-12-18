//var username = "Player 2";

var notifySound = new sound("audio/MessageAlert.mp3");

//var socket = io({transports: ['websocket'], upgrade: false});
var addLi = (message, user) => {
	var outerMessageDiv = document.createElement('div');
	var newMessageDiv = document.createElement('div');

	// Add tooltip to message
	var spanToolTip = document.createElement('span');
	spanToolTip.classList.add('tooltiptext'); // tooltiptext-user

	if (user) {
		outerMessageDiv.classList.add('right-outer');
		spanToolTip.innerHTML = 'Sent: ' + new Date();
		newMessageDiv.classList.add('chat', 'right-inner', 'tooltip');
		spanToolTip.classList.add('tooltiptext-user'); // Keep tool tip to the left to make visible for user side messages
	} else {
		outerMessageDiv.classList.add('left-outer');
		spanToolTip.innerHTML = 'Received: ' + new Date();
		newMessageDiv.classList.add('chat', 'left-inner', 'tooltip');
		spanToolTip.classList.add('tooltiptext');
	}

	newMessageDiv.appendChild(document.createTextNode(message));
	newMessageDiv.appendChild(spanToolTip);
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
	socket.emit('message', { msg: document.getElementById('messagetext').value, gameID: game.gameID, username: player.name });

	addLi(document.getElementById('messagetext').value, true); // Add current user message
	document.getElementById('messagetext').value = ""; // reset the message input box
});

// Send text when enter key is pressed
document.getElementById("messagetext")
	.addEventListener("keyup", function (event) {
		event.preventDefault();
		if (event.keyCode === 13) {	// If return / enter is pressed
			document.getElementById("inputBtn").click(); // Same as clicking message send button
		}
	});

socket.on('message', (data) => {
	addLi(data.msg, false); // Add external user message
	notifySound.play(); // Play notification sound
});

//socket.on('user.events', (message) => addLi(message, false));