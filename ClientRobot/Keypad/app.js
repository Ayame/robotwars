var serialport = require('serialport');
var request = require('request');
var keypress = require('keypress');

var portname = process.argv[2];

var myPort = new serialport(portname, {
	bauttRate: 115200,
	parser:serialport.parsers.readline("\r\n")
})

let playerID;

myPort.on('open', onOpen);
myPort.on('data', onrecieveData);
myPort.on('error', showError)

function onOpen()
{
	console.log("Connection to Droid!");
}

function onrecieveData(data)
{
	console.log("Received data: " + data);
	if(data = 'HIT')
	{
		 sendDataServer('/game/0/player/' + playerID + '/hit', 'POST');
	}
}

function sendDataBluetooth(data)
{
	console.log("Sending to Droid: " + data);
	myPort.write("");
	myPort.write(data);
	myPort.write("\n");
}

function sendDataServer(data, method)
{
	var url = 'http://localhost:3000' + data;
	// Set the headers
	var headers = {
		'User-Agent':       'Super Agent/0.0.1',
		'Content-Type':     'application/x-www-form-urlencoded'
	}

	// Configure the request
	var options = {
		url: url,
		method: method,
		headers: headers,
	}

	console.log(url);
	// Start the request
	request(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			// Print out the response body
			var obj = JSON.parse(body);
			
			if(obj.action == 'identifyPlayer')
			{
				playerID = obj.result.id;
			}
		}
	});
}

function showError(error) 
{
   console.log('Serial port error: ' + error);
}



// use decoration to enable stdin to start sending events 
keypress(process.stdin);
// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
    if (key && key.ctrl && key.name == 'c') {
      process.stdin.pause();
    }
	
	switch(key.name)
	{
		case 'up':
			console.log(key.name);
			sendDataBluetooth('d');
		break;
		
		case 'down':
			console.log(key.name);
			sendDataBluetooth('b');
		break;
		
		case 'left':
			console.log(key.name);
			sendDataBluetooth('l');
		break;
		
		case 'right':
			console.log(key.name);
			sendDataBluetooth('r');
		break;
		
		case 'space':
			console.log(key.name);
			sendDataBluetooth('f');
			sendDataServer('/game/0/player/' + playerID + '/ammo', 'GET');
		break;
		
		case 'x':
			console.log(key.name);
			sendDataServer('/game/0/player/' + playerID + '/ammo', 'POST');
		break;
		
		case 'escape':
			console.log(key.name);
			sendDataBluetooth('s');
		break;
		
		case 'return':
			console.log(key.name);
			sendDataServer('/game/0/player', 'POST');
		break;
	}
});

process.stdin.setRawMode(true);
process.stdin.resume();