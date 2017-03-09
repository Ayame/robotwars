var socket;

//sending data to bluetooth controller
function openSocket() {
	socket.send("Player connecting...");
}

//showing received data from bluetooth controller
function showData(result) {
	console.log(result.data)
}

$(document).ready(function(){

	socket = new WebSocket("ws://localhost:8081");

	// The socket connection needs two event listeners:
	socket.onopen = openSocket;
	socket.onmessage = showData;
});