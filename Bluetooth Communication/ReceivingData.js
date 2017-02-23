var serialport = require('serialport');

var portname = process.argv[2];

var myPort = new serialport(portname, {
	bauttRate: 9600,
	parser:serialport.parsers.readline("\r\n")
})

myPort.on('open', onOpen);
myPort.on('data', onrecieveData);

function onOpen()
{
	console.log("open connection");
}

function onrecieveData()
{
	console.log("Received data: " + data);
}