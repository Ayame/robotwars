"use strict";

const uuidV4 = require('uuid/v4');

function Game() {
    this.started = false;
    this.ended = false;
    this.players = [];
    this.logs = [];
}

Game.prototype.log = function(data){
    data.timestamp = new Date();
    this.logs.push(data);
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

Game.player2game = {};
Game.getGame4player = function(p){
    return Game.player2game[p];
}

Game.prototype.createPlayer = function(name){
    let p = new Player(name, uuidV4());
    Game.player2game[p] = this;
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

Game.prototype.getNextAvailablePlayer = function(name)
{
    const defaultNames = [ "WizzKid", "The Enforcer" ];
    if (this.players.length < 2)
    {
        return this.createPlayer(name || defaultNames[this.players.length]);
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

function Player(name, id) {
    this.name = name;
    this.id = id;
    this.ammo = undefined;
    this.health = 20; // TO DO
}

Player.prototype.log = function(data){
    data.player = this.id;
    var game =  Game.getGame4player(this);
    console.log("game for ", this.name, game);
    game.log(data);
}

Player.prototype.fetchAmmo = function() {
    this.ammo = Ammo.dequeue();
    this.log({
        action : "fetchAmmo",
        value  : this.ammo
    });
}

Player.prototype.takeHit = function(ammo)
{
    this.health -= ammo.hit;
    this.log({
        action : "takeHit",
        value  : ammo.hit
    });

    if( this.health<=0 ){
        this.health = 0;
        Game.getGame4player(this).ended = true;
    }
};

Player.prototype.hit = function(player)
{
    if (this.shotAmmo) {
        player.takeHit(this.shotAmmo);
		this.shotAmmo = null;
		return true;
	} else {
		return false;
	}
};

Player.prototype.fire = function(){
    this.shotAmmo = this.ammo;
    this.ammo = null;
    this.log({
        action : "fire",
        value  : this.shotAmmo
    });
}

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