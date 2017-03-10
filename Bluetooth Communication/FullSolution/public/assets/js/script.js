var socket;

$(document).keydown(function(e){
	console.log(e.keyCode);
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
		socket.send("LOGIN");
		return false;
    }

	if (e.keyCode == 65) { 
		socket.send("GETAMMO");
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
		//socket.send("HIT");
		//send hit to server
	}
}

function reportOnGamepad() {
var gp = navigator.getGamepads()[0];

	if(gp.buttons[9].pressed) //start button
	{
		socket.send("LOGIN");
	}

	if(gp.buttons[0].pressed) //x button
	{
		e.preventDefault();
		socket.send("f");
	}
	
	if(gp.buttons[2].pressed) //square button
	{
		e.preventDefault();
		socket.send("GETAMMO");
	}
	
		if(gp.buttons[1].pressed) //circle button
	{
		e.preventDefault();
		socket.send("s");
	}
	
		if(gp.buttons[12].pressed) //up button
	{
		e.preventDefault();
		socket.send("d");
	}
	
	if(gp.buttons[13].pressed) //down button
	{
		e.preventDefault();
		socket.send("b");
	}
	
	if(gp.buttons[14].pressed) //left button
	{
		e.preventDefault();
		socket.send("l");
	}
	
	if(gp.buttons[15].pressed) //right button
	{
		e.preventDefault();
		socket.send("r");
	}
	
}

  var hasGP = false;
    var repGP;
 
    function canGame() {
        return "getGamepads" in navigator;
    }

$(document).ready(function(){

	socket = new WebSocket("ws://localhost:8082");

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
		socket.send("GETAMMO");
	});

	$("#select").on("click", function(e){
		e.preventDefault();
		socket.send("s");
	});
	
	$("#start").on("click", function(e){
		e.preventDefault();
		socket.send("LOGIN");		
	});

        if(canGame()) {
 
            var prompt = "To begin using your gamepad, connect it and press any button!";
            $("#gamepadPrompt").text(prompt);
 
            $(window).on("gamepadconnected", function() {
                hasGP = true;
                $("#gamepadPrompt").html("Gamepad connected!");
                console.log("connection event");
                repGP = window.setInterval(reportOnGamepad,100);
            });
 
            $(window).on("gamepaddisconnected", function() {
                console.log("disconnection event");
                $("#gamepadPrompt").text(prompt);
                window.clearInterval(repGP);
            });
 
            //setup an interval for Chrome
            var checkGP = window.setInterval(function() {
                console.log('checkGP');
                if(navigator.getGamepads()[0]) {
                    if(!hasGP) $(window).trigger("gamepadconnected");
                    window.clearInterval(checkGP);
                }
            }, 500);
        }
 
    
 
  
});