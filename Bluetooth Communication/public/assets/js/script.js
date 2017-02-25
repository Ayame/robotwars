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

	if (e.keyCode == 76) { 
		e.preventDefault();
		var username = prompt("Give your username to log in.","");
		if(username != null)
		{
			alert(username + " logging in!")
		}	
		return false;
    }

	if (e.keyCode == 65) { 
		alert("I need AMMO!");
       return false;
    }	
});

function openSocket() {
	socket.send("Player connecting...");
}

function showData(result) {
	console.log(result.data)
	if(result.data == "HIT")
	{
		//send hit to server
	}
}


$(document).ready(function(){

	socket = new WebSocket("ws://localhost:8081");

	// The socket connection needs two event listeners:
	socket.onopen = openSocket;
	socket.onmessage = showData;

	$("#UP").on("click", function(e){
    e.preventDefault();
		socket.send("forward");
	});

	$("#DOWN").on("click", function(e){
    e.preventDefault();
		socket.send("backwards");
	});


	$("#LEFT").on("click", function(e){
    e.preventDefault();
		socket.send("left");
	});


	$("#RIGHT").on("click", function(e){
    e.preventDefault();
		socket.send("right");
	});


	$("#A").on("click", function(e){
    e.preventDefault();
		socket.send("FIRE");
	});


	$("#B").on("click", function(e){
    e.preventDefault();
		alert("I need AMMO!")
	});

	$("#select").on("click", function(e){
    e.preventDefault();
		socket.send("stopMotor");
	});
	
	$("#start").on("click", function(e){
    e.preventDefault();
	var username = prompt("Give your username to log in.","");
	if(username != null)
	{
		alert(username + " logging in!")
	}
		
	});
	
	
	
});
