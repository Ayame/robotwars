var debounce = require('debounce');
var serialport = require('serialport');
var WebSocketServer = require('ws').Server;
	
var request = require('request');

var portname = process.argv[2];

var myPort = new serialport(portname, {
	bauttRate: 115200,
	parser:serialport.parsers.readline("\r\n")
})


var SERVER_PORT = 8082;               // port number for the webSocket server
var wss = new WebSocketServer({port: SERVER_PORT}); // the webSocket server
var connections = new Array;          // list of connections to the server

let playerID;

myPort.on('open', onOpen);
myPort.on('data', onrecieveData);
myPort.on('error', showError)
//rl.on('line', sendData);
wss.on('connection', handleConnection);
wss.on('error', showError);
 
function handleConnection(client) {
	console.log("New Connection"); // you have a new client
	connections.push(client); // add this client to the connections array

	client.on('message', sendData); // when a client sends a message,

	client.on('close', function() { // when a client closes its connection
	console.log("connection closed"); // print it out
	var position = connections.indexOf(client); // get the client's position in the array
	connections.splice(position, 1); // and delete it from the array
 });
}

function onOpen()
{
	console.log("open connection");
}

function onrecieveData(data)
{
	 for (myConnection in connections) 
	 {   // iterate over the array of connections
		connections[myConnection].send(data); // send the data to each connection
	 }
	console.log("Received data: " + data);
	if(data = 'HIT')
	{
		 sendDataServer('/game/0/player/' + playerID + '/hit', 'POST');
	}
}

function sendData(data)
{
	if(data == "LOGIN")
	{
		sendDataServer('/game/0/player', 'POST');
	}
	
	if(data == "GETAMMO")
	{
		 sendDataServer('/game/0/player/' + playerID + '/ammo', 'POST');
	}
	
	if(data == "f")
	{
		sendDataBluetooth('f');
		sendDataServer('/game/0/player/' + playerID + '/ammo', 'GET');
	}

	
}

function sendDataBluetooth(data)
{
	console.log("sending to serial: " + data);
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