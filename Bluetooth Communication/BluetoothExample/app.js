var serialport = require('serialport');
//var readline = require('readline');
var WebSocketServer = require('ws').Server;

var portname = process.argv[2];

var myPort = new serialport(portname, {
	bauttRate: 9600,
	parser:serialport.parsers.readline("\r\n")
})

/* use readline from the console for testing without webservice 

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
 
//Incoming socket connections and handle incoming data
function handleConnection(client) {
	console.log("New Connection"); // you have a new client
	connections.push(client); // add this client to the connections array

	client.on('message', sendDataBluetooth); // when a client sends a message,

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


//receiving data on the COM port and sending to the open connections
function onrecieveData(data)
{
	 for (myConnection in connections) 
	 {   // iterate over the array of connections
		connections[myConnection].send(data); // send the data to each connection
	 }
	console.log("Received data: " + data);
}

function sendDataBluetooth(data)
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
