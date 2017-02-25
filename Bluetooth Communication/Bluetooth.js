var serialport = require('serialport');
var readline = require('readline');

var portname = process.argv[2];

var myPort = new serialport(portname, {
	bauttRate: 9600,
	parser:serialport.parsers.readline("\r\n")
})

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

myPort.on('open', onOpen);
myPort.on('data', onrecieveData);
myPort.on('error', showError)
rl.on('line', sendData);

function onOpen()
{
	console.log("open connection");
}

function onrecieveData(data)
{
	console.log("Received data: " + data);
}

function sendData(input)
{
	myPort.write("");
	myPort.write(input);
	myPort.write("\n");
}

function showError(error) 
{
   console.log('Serial port error: ' + error);
}