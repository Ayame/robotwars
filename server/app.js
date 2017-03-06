const express = require('express');
const app = express();


const Game = require("./classes.js").Game;
const Ammo = require("./classes.js").Ammo;

app.use(express.static("public"));

app.use('/game/:gameId/', (req,res,next)=>{
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

app.get('/game/', showGames);
app.get('/game/:gameId', showGameState);
app.get('/game/:gameId/player/:playerId', showPlayerState);
app.get('/game/:gameId/player/:playerId/ammo', fetchAmmo);

app.post('/game/:gameId/player/', identifyPlayer);
app.post('/game/:gameId/player/:playerId/ammo', fire);
app.post('/game/:gameId/player/:playerId/hit', reportHit);

app.delete('/game/:gameId', stopGame);

Game.initGames(2);

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

function showGames(req,res){
	res.json(Game.games);
}

function showGameState(req,res){
	res.json(req.game);
}

function showPlayerState(req,res){
	res.json(req.player);
}

function fetchAmmo(req,res) {
    req.player.ammo = Ammo.dequeue();

    res.json({
		action:"fetchAmmo",
		result:(req.player.ammo.hit === 0 ? "NOK" : "OK")
	});
}

function identifyPlayer(req,res){
	res.json({
		action:"identifyPlayer",
		result:req.game.getNextAvailablePlayer()
	});
}

function fire(req,res){
	req.player.shotAmmo = req.player.ammo;
    req.player.ammo = null;
	res.json({
		action:"fire",
		result: req.player.shotAmmo
	});
}

function reportHit(req, res){
	var adv = req.game.getAdversary(req.player);
	res.json({
		action:"reportHit",
		result: adv.hit(req.player)
	});
}

function stopGame(req, res){
	res.send("stopGame:"+JSON.stringify(req.game));
}


/*******************************************************************/



