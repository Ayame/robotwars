"use strict";

const uuidV4 = require('uuid/v4');

function Game() {
    this.started = false;
    this.ended = false;
    this.players = [];
    //this.createPlayer();
    //this.createPlayer();
}

Game.initGames = function(gameCount)
{
    Game.games = [];

    for (let i = 0; i < gameCount; i++)
    {
        Game.games.push(new Game());
    }
};

Game.find = function(id){
    return Game.games[id];
};

Game.prototype.createPlayer = function(){
    let p = new Player(uuidV4());
    this.players.push(p);
    return p;
};

Game.prototype.getPlayer = function(id){
    if (isInt(id))
    {
        return this.players[id];
    }
    else
    {
        return this.players.find(p=>p.id===id);
    }
};

Game.prototype.deletePlayer = function(id){
    delete this.players[id];
};

Game.prototype.getNextAvailablePlayer = function()
{
    if (this.players.length < 2)
    {
        return this.createPlayer();
    }
    else
    {
        return null;
    }
};

Game.prototype.getAdversary = function(homePlayer)
{
    return this.players.find(p => p !== homePlayer);
};

function Player(id) {
    this.id = id;
    this.ammo = undefined;
    this.health = 20; // TO DO
}

Player.prototype.takeHit = function(ammo)
{
    this.health -= ammo.hit;
    if( this.health<=0 ){
        this.health = 0;
    }
};

Player.prototype.hit = function(player)
{
    if (this.shotAmmo)
	{
		player.takeHit(this.shotAmmo);
		this.shotAmmo = null;
		return true;
	} else {
		return false;
	}
};

function Ammo(hit) {
    this.hit = hit;
}

Ammo.dequeue = function(){
    return new Ammo(Math.floor(Math.random() * 3));
};


function isInt(value) {
    return !isNaN(value) &&
        parseInt(Number(value)) == value &&
        !isNaN(parseInt(value, 10));
}

module.exports = {
    Game   : Game,
    Player : Player,
    Ammo   : Ammo
};