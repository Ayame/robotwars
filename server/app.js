"use strict";
const http = require('http');
const express = require('express');
const io = require('socket.io');

const bodyParser = require('body-parser');
const app = express();

var server = http.createServer(app);
var serverSocket = io(server);

const Game = require("./classes.js").Game;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

// Add headers
app.use(function (req, res, next) {
	// Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use('/game/:gameId', (req,res,next)=>{
	req.game = Game.find(req.params.gameId);
	if ( !req.game ) {
		res.send({error:"Failed to find game"});
	} else {
		next();
	}
});

app.use('/game/:gameId/player/:playerId', (req,res,next)=>{
	req.player = req.game.getPlayer(req.params.playerId);
	if ( !req.player ) {
		res.send({error:"Failed to find player"});
	} else {
		console.log("player set");
		next();
	}
});


app.get('/game', showGames);
app.get('/game/:gameId', showGameState);
app.get('/game/:gameId/player/:playerId', showPlayerState);
app.get('/game/:gameId/player/:playerId/ammo', fetchAmmo);
/*app.get('/client',function(req,res){
    res.sendFile(__dirname + '/client/sockettest.html');
});*/
app.post('/game/:gameId/start', startGame);
app.post('/game/:gameId/stop', stopGame);

app.post('/game/:gameId/player', identifyPlayer);
app.post('/game/:gameId/player/:playerId/ammo', fire);
app.post('/game/:gameId/player/:playerId/hit', reportHit);

app.delete('/game/:gameId', stopGame);

Game.initGames(2);

//noinspection JSUnusedLocalSymbols
function showGames(req,res){
	res.json(Game.games);
}

function showGameState(req,res){
	res.json(req.game);
}

function startGame(req,res){
    req.game.started = true;
    res.json(req.game);
}

function stopGame(req,res){
    req.game.ended = req.body.winner || true;
    res.json(req.game);
}


function showPlayerState(req,res){
	res.json(req.player);
}

function fetchAmmo(req,res) {
    req.player.fetchAmmo();
    console.log(req.player.name,"->",req.player.ammo.hit);
    res.json({
		action:"fetchAmmo",
		result:(req.player.ammo.hit === 0 ? "NOK" : "OK")
	});
}

function identifyPlayer(req,res){
	console.log(req.body);
	res.json({
		action:"identifyPlayer",
		result:req.game.getNextAvailablePlayer(req.body && req.body.name)
	});
}

function fire(req,res){
	req.player.fire();
	res.json({
		action:"fire",
		result: req.player.shotAmmo
	});
}

function reportHit(req, res){
	var adv = req.game.getAdversary(req.player);
	if (adv) {
        res.json({
            action:"reportHit",
            result: adv.hit(req.player)
        });
	} else {
        res.json({
            action:"reportHit",
            error: "no adversary found"
        });
	}

}


function gameId2roomName(id){
    return "game-"+id;
}

var SocketMessages = {
    listenToGame : "listenToGame",
    gameLog : "gameLog",
    serverMsg : "serverMsg",
    gameOver : "gameOver"
};

serverSocket.on("connection", handleNewSocket);

function handleNewSocket(socket) {
    var games = [];

    socket.on(SocketMessages.listenToGame, function(gameId) {
        console.log('--- INCOMING -- ' + SocketMessages.listenToGame + ' for game ' + gameId)
        var game = Game.find(gameId);
        if ( game ) {
            if ( games.indexOf(game)<0 ) {
                games.push(game);
                if (!game.observer) {
                    game.observer = function(data){
                        let roomName =  gameId2roomName( game.getId() );
                        console.log("sending to "+roomName);
                        serverSocket.to( roomName ).emit(SocketMessages.gameLog, data);
                    };
                    console.log("observer installed: "+game.observer);
                }
                socket.join( gameId2roomName(gameId) );
                socket.emit(SocketMessages.serverMsg, "listening to game " + gameId);
            } else {
                socket.emit(SocketMessages.serverMsg, "ERROR: Already listening to game " + gameId);
            }
        } else {
            socket.emit(SocketMessages.serverMsg, "ERROR: Failed to listen to game " + gameId);
        }
    } );
    socket.on(SocketMessages.gameOver, function(gameId) {
        console.log("game "+gameId + " finished");
    });

    socket.emit(SocketMessages.serverMsg,'Welcome new droid');
}

/*******************************************************************/


server.listen(3000, function () {
    console.log('App listening on port 3000!');
});


