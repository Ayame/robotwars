var debounce = require('debounce');
var serialport = require('serialport');
//var readline = require('readline');
var WebSocketServer = require('ws').Server;
var xbox = require('xbox-controller-node');
var request = require('request');

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

function sendDataServer(data, method)
{
// Set the headers
var headers = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type':     'application/x-www-form-urlencoded'
}

if method == "GET"
{
	// Configure the request
	var options = {
		url: 'http://localhost:3000',
		method: 'GET',
		headers: headers,
		qs: {data}
	}	
}else{
		// Configure the request
	var options = {
		url: 'http://localhost:3000',
		method: 'POST',
		headers: headers,
		form: {'key': data}
	}

}

// Start the request
request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        // Print out the response body
        console.log(body);
    }
})
	
}

function showError(error) 
{
   console.log('Serial port error: ' + error);
}

//use of the xbox gamepad instead of web cliënt controller
xbox.on('a', debounce(sendDataBluetooth("f", 200));
xbox.on('x', debounce(sendDataServer("{GETAMMO}", "GET", 200));
xbox.on('start', debounce(sendDataServer("LOGIN", "POST", 200));
xbox.on('up', debounce(sendDataBluetooth("d", 200));
xbox.on('down', debounce(sendDataBluetooth("b", 200));
xbox.on('left', debounce(sendDataBluetooth("l", 200));
xbox.on('right', debounce(sendDataBluetooth("r", 200));