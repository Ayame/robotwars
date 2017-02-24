const threads = require('threads');
const config  = threads.config;
const spawn   = threads.spawn;
 
// Set base paths to thread scripts 
config.set({
  basepath : {
    browser : 'http://myserver.local/thread-scripts',
    node    : __dirname + '/../thread-scripts'
  }
});
 
const thread = spawn('ReceivingData.js');
 
thread
  .send({ do : 'COM7' })
  .on('message', readMessage);
  
  
function readMessage(message) 
{
	console.log('Received data:', message);
}

