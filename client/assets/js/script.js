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
            animateLogo.then(loadCurrentGame); // Make get current game promise? Socket promise?
        }, 1500); // Stick to 1500ms to allow for initial animation to finish

    };

    var loadCurrentGame = function () {
        // Get the current game
        socket.emit(config.socketMessages.listenToGame,config.gameId);

        // TODO: dit moet vervangen worden in een gamelog!!!
        currentGame = new Game(false, false);
        listenToGameEvents();
    };

    var listenToGameEvents = function(){
        socket.on(config.socketMessages.gameLog,function(gameLog){
            verbose.log('%c --- INFO --- ' + gameLog.action ,'background: #07dc11; color: #FFF');
            interfaceModule[gameLog.action](gameLog);
        })
    };

     var identifyPlayer = function(gameLog){
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
                    $('#player1 .ready').css('display', 'inline-block');
                    $('#player2 .hurry').show();
                    reject();
                } else {
                    // The second player has been added, move to the next screen
                    $('#player2 .hurry').hide();
                    $('#player2 .ready').css('display', 'inline-block');

                    // Start animation new screen
                    resolve();
                }

            }
        }
    };


    var getCurrentGame = function(){
        // return a quick deep copy of the object
        //return JSON.parse(JSON.stringify(currentGame));
        //return jQuery.extend(true, {}, currentGame);
        // No deep ocpy but return the reference because it needs to be modified by the interface animation module by design
        return currentGame;
    };


    var getRandomBox = function(){
        var randomIndex = helperFunctions.getRandomInt(0,currentGame.boxes.length -1);
        var randomBox = currentGame.boxes[randomIndex];
        if(!randomBox.visible){getRandomBox();}

        return randomBox.$htmlelement;
    };

    /********  SPECIAL ACTION FUNCTIONS **********/

        // I will need to turn these guys into promises, but that's a worry for tomorrow
    var fetchAmmo = function(action){
        verbose.log('%c --- AMMO --- for ' + currentGame.getPlayerById(action.player).name,'background: #222; color: #bada55');
        interfaceAnimatorModule.selectItemBox('#'+currentGame.getPlayerById(action.player).htmlId, getRandomBox());
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
        getCurrentGame: getCurrentGame
    }

})();



$(document).ready(function () {
    interfaceModule.init();
});