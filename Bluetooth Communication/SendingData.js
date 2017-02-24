var serialport = require('serialport');
const readline = require('readline');

var portname = process.argv[2];

var myPort = new serialport(portname, {
	bauttRate: 9600,
	parser:serialport.parsers.readline("\r\n")
})

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', sendData);
myPort.on('error', showError);

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