// Created by jillvandendriessche on 22/02/17.
function Game(started, ended) {
    this.started = started;
    this.ended = ended;
    this.players = [];
    this.boxes = [];

}

Game.prototype.getPlayerById = function(id){
    return this.players.find(function(player){return player.id === id});
};