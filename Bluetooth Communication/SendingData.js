var serialport = require('serialport');

var portname = process.argv[2];
var command = process.argv[3];

var myPort = new serialport(portname, {
	bauttRate: 9600,
	parser:serialport.parsers.readline("\r\n")
})

function sendData()
{
	serialport.write(command);
}