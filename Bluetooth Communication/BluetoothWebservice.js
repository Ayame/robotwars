var serialport = require('serialport');
//var readline = require('readline');
var WebSocketServer = require('ws').Server;
var xbox = require('xbox-controller-node');

var portname = process.argv[2];

var myPort = new serialport(portname, {
	bauttRate: 9600,
	parser:serialport.parsers.readline("\r\n")
})

/* use readline for testing without webservice from the console

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
*/

var SERVER_PORT = 8081;               // port number for the webSocket server
var wss = new WebSocketServer({port: SERVER_PORT}); // the webSocket server
var connections = new Array;          // list of connections to the server


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
}

function sendData(data)
{
	console.log("sending to serial: " + data);
	myPort.write("");
	myPort.write(data);
	myPort.write("\n");
}

function showError(error) 
{
   console.log('Serial port error: ' + error);
}


//use of the xbox gamepad instead of web cliënt controller
xbox.on('a', function () {
  console.log('[A] button press');
});

xbox.on('x', function () {
  console.log('[X] button press');
});
  
xbox.on('start', function () {
  console.log('[Start] button press');
});
 
 
//Manage sticks events 
 
xbox.on('leftstickLeft', function () {
  console.log('Moving [LEFTSTICK] LEFT');
});
 
xbox.on('leftstickLeft:release', function () {
  console.log('Released [LEFTSTICK] LEFT');
});
 
xbox.on('leftstickRight', function () {
  console.log('Moving [LEFTSTICK] RIGHT');
});
 
xbox.on('leftstickRight:release', function () {
  console.log('Released [LEFTSTICK] RIGHT');
})
 
xbox.on('leftstickDown', function () {
  console.log('Moving [LEFTSTICK] DOWN');
});
 
xbox.on('leftstickUp', function () {
  console.log('Moving [LEFTSTICK] UP');
});