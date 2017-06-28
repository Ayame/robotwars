var debounce = require('debounce');
var serialport = require('serialport');
var xbox = require('xbox-controller-node');	
var request = require('request');

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
	myPort.write(data + "\n");
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

//use of the xbox gamepad instead of web cliënt controller
xbox.on('error', showError);

xbox.on('a',debounce( function () {
  sendDataBluetooth('f');
  sendDataServer('/game/0/player/' + playerID + '/ammo', 'GET');
}));

xbox.on('x',debounce( function () {
   sendDataServer('/game/0/player/' + playerID + '/ammo', 'POST');
}));

xbox.on('b',debounce( function () {
  sendDataBluetooth('s');
}));

xbox.on('start',debounce( function () {
  sendDataServer('/game/0/player', 'POST');
}));

xbox.on('up',debounce( function () {
  sendDataBluetooth('d');
}));

xbox.on('down',debounce( function () {
  sendDataBluetooth('b');
}));

xbox.on('left',debounce( function () {
  sendDataBluetooth('l');
}));

xbox.on('right',debounce( function () {
  sendDataBluetooth('r');
}));