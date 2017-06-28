/**
 * Created by jillvandendriessche on 22/02/17.
 */


var interfaceModule = (function () {
    var currentGame;
    var lastProcessedTimestamp= 0;
    var firstActionsLoad = true;
    var socket = io('http://localhost:3000');


    var init = function () {

        // Listen to server messages and output them to the console
        socket.on(config.socketMessages.serverMsg,function(serverMessage){
            verbose.log('%c --- SERVER MESSAGE ---  ' + serverMessage,'background: #f5fd00; color: #56564b');
        });

        // Show intro for a second -> fade to waiting screen (CSS animation triggered)
        setTimeout(function () {
            var animateLogo = new Promise(interfaceAnimatorModule.animateSplashScreen);
            animateLogo.then(loadCurrentGame);
        }, 1500); // Stick to 1500ms to allow for initial animation to finish

    };

    var loadCurrentGame = function () {
        // Get the current game
        socket.emit(config.socketMessages.listenToGame,config.gameId);

        // TODO: needs to be handled by a gamelog event!!!
        currentGame = new Game(false, false);
        listenToGameEvents();
    };

    var listenToGameEvents = function(){
        socket.on(config.socketMessages.gameLog,function(gameLog){
            verbose.log('%c --- INFO --- ' + gameLog.action ,'background: #07dc11; color: #FFF');
            interfaceModule[gameLog.action](gameLog);
        })
    };

     var identifyPlayer = function(gameLog){// Send message to server

         verbose.log(' --- DUMP --- ',gameLog);
         var handlePlayerRegistrationPromise = new Promise(handlePlayerRegistration(gameLog.result));
         handlePlayerRegistrationPromise.then(function(){interfaceAnimatorModule.initRound()}).catch(function(){console.log('Player one waiting for two ...');});
    };

    var handlePlayerRegistration = function(player){
        return function(resolve,reject){
            // Check if in Game.players already
            if (
                currentGame.players.find(
                    (p) => {
                        return p.id === player.id
                    }
                ) === undefined

            ) {
                // Add if not and consider it the first player
                currentGame.players.push(new Player(player.id,
                    player.name,
                    player.health * config.healthFactor,
                    'player'+(currentGame.players.length + 1) ));

                verbose.log('%c --- INFO --- player processed ' + player.name ,'background: #07dc11; color: #FFF');

                // Check how many players there are now
                if(currentGame.players.length === 1){
                    interfaceAnimatorModule.showPlayerStatus($('#player1 .ready'),true);
                    reject();
                } else {
                    // The second player has been added, move to the next screen
                    interfaceAnimatorModule.showPlayerStatus($('#player2 .ready'),false);

                    // Start animation new screen
                    resolve();
                }

            }
        }
    };


    var getCurrentGame = function(){
        // No deep copy but return the reference because it needs to be modified by the interface animation module by design
        return currentGame;
    };

    var battleTimeUp = function(){
        // Hardcoded on 2 players for speed purposes in this demo
        var winner = currentGame.players[0];
        var loser = currentGame.players[1];

        // Determine winner -> there is no tie
        if(winner.health < loser){
            winner = currentGame.players[1];
            loser = currentGame.players[0];
        }

        // Show animation
        interfaceAnimatorModule.finishHim(winner,loser);

        // Send message to server
        triggerGameOver(config.gameId,winner);
    };

    var triggerGameOver = function(gameId, winner) {
        // Send message to server
        socket.emit(config.socketMessages.gameOver,{game: gameId, player: winner})
    };

    /********  SPECIAL ACTION FUNCTIONS **********/

        // I will need to turn these guys into promises, but that's a worry for tomorrow
    var fetchAmmo = function(action){
        verbose.log('%c --- AMMO --- for ' + currentGame.getPlayerById(action.player).name,'background: #222; color: #bada55');
        interfaceAnimatorModule.selectItemBox('#'+currentGame.getPlayerById(action.player).htmlId, helperFunctions.getRandomBox());
    };

    var fire = function(action){
        verbose.log('%c --- FIRE --- for ' + currentGame.getPlayerById(action.player).name + ' with ' + action.value.hit + ' damage','background: #F00; color: #FFF');
        interfaceAnimatorModule.fireItem(action);
        interfaceAnimatorModule.unselectItemBox(action);
    };

    var takeHit = function(action){
        var currentPlayer = currentGame.getPlayerById(action.player);
        var damageDealer = (currentPlayer.htmlId === 'player1')?1:0; // Ok this is really bad, but ideally the server would send who dealt the damage I am now passing the index in the array
        verbose.log('%c --- HIT --- for ' + currentPlayer.name + ' with ' + action.value + ' damage','background: #0FF; color: #FFF');
        currentPlayer.animateHealth(action.value * config.healthFactor, $('#'+currentPlayer.htmlId + ' figure').siblings('.healthbar').find('.visible-bar'),currentGame,damageDealer);
    };


    return {
        init: init,
        fetchAmmo: fetchAmmo,
        fire: fire,
        takeHit: takeHit,
        identifyPlayer: identifyPlayer,
        getCurrentGame: getCurrentGame,
        battleTimeUp: battleTimeUp,
        triggerGameOver: triggerGameOver
    }

})();



$(document).ready(function () {
    interfaceModule.init();
});