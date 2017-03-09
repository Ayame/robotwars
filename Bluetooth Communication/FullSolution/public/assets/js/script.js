var socket;

$(document).keydown(function(e){
    if (e.keyCode == 37) { 
		socket.send("l");
		return false;
    }
	if (e.keyCode == 38) { 
       socket.send("d");
       return false;
    }
	
	if (e.keyCode == 39) { 
		socket.send("r");
       return false;
    }
	
    if (e.keyCode == 40) { 
		socket.send("b");
       return false;
    }

	if (e.keyCode == 32) { 
		socket.send("f");
       return false;
    }
	
	if (e.keyCode == 13) { 
		socket.send("s");
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
		socket.send("d");
	});

	$("#DOWN").on("click", function(e){
    e.preventDefault();
		socket.send("b");
	});


	$("#LEFT").on("click", function(e){
    e.preventDefault();
		socket.send("l");
	});


	$("#RIGHT").on("click", function(e){
    e.preventDefault();
		socket.send("r");
	});


	$("#A").on("click", function(e){
    e.preventDefault();
		socket.send("f");
	});


	$("#B").on("click", function(e){
    e.preventDefault();
		alert("I need AMMO!")
	});

	$("#select").on("click", function(e){
    e.preventDefault();
		socket.send("s");
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