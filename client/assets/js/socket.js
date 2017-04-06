var SocketMessages = {
    listenToGame : "listenToGame",
    gameLog :      "gameLog",
    serverMsg :    "serverMsg"
};

$log = $("#log");

var socket = io();

socket.emit(SocketMessages.listenToGame, 0);

socket.on(SocketMessages.gameLog, function(data){
    var html = "<h1>gameLog</h1>" + JSON.stringify(data);
    $log.prepend("<li>"+html+"</li>");
} );

socket.on(SocketMessages.serverMsg, function(data){
    var html = "<h1>serverMsg</h1>" + JSON.stringify(data);
    $log.prepend("<li>"+html+"</li>");
} );