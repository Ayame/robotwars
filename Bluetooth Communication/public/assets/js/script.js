var socket;

$(document).keydown(function(e){
    if (e.keyCode == 37) { 
		socket.send("left");
		return false;
    }
	if (e.keyCode == 38) { 
       socket.send("forward");
       return false;
    }
	
	if (e.keyCode == 39) { 
		socket.send("right");
       return false;
    }
	
    if (e.keyCode == 40) { 
		socket.send("backwards");
       return false;
    }

	if (e.keyCode == 32) { 
		socket.send("FIRE");
       return false;
    }
	
	if (e.keyCode == 13) { 
		socket.send("stopMotor");
       return false;
    }		
});

function openSocket() {
	socket.send("Hello server");
}

function showData(result) {
	console.log(result.data)
}


$(document).ready(function(){

	socket = new WebSocket("ws://localhost:8081");

	// The socket connection needs two event listeners:
	socket.onopen = openSocket;
	socket.onmessage = showData;
});
