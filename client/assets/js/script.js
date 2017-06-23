/**
 * Created by jillvandendriessche on 22/02/17.
 */


var interfaceModule = (function () {
    var self = this; // Needed to access dynamically called functions

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
            var animateLogo = new Promise(animateSplashScreen);
            animateLogo.then(getCurrentGame); // Make get current game promise? Socket promise?
        }, 1500); // Stick to 1500ms to allow for initial animation to finish

    };

    var getCurrentGame = function () {
        // Get the current game
        socket.emit(config.socketMessages.listenToGame,config.gameId);

        // TODO: dit moet vervangen worden in een gamelog!!!
        currentGame = new Game(false, false);
        listenToGameEvents();
    };

    var listenToGameEvents = function(){
        socket.on(config.socketMessages.gameLog,function(gameLog){
            verbose.log('%c --- INFO --- ' + gameLog.action ,'background: #07dc11; color: #FFF');
            self[gameLog.action](gameLog);
        })
    };

    this.identifyPlayer = function(gameLog){
        verbose.log(' --- DUMP --- ',gameLog);
        var handlePlayerRegistrationPromise = new Promise(handlePlayerRegistration(gameLog.result));
        handlePlayerRegistrationPromise.then(initRound).catch(function(){console.log('player one waiting for two')});
    };

    var handlePlayerRegistration = function(player){
        return function(resolve,reject){
            // Check if in Game.players already
            if (
                currentGame.players.find((p) => {
                    return p.id === player.id
                }) === undefined

            ) {
                // Add if not and consider it the first player
                currentGame.players.push(new Player(player.id,
                    player.name,
                    player.health * config.healthFactor,
                    'player'+(currentGame.players.length + 1) ));

                verbose.log('c% --- INFO --- player processed ' + player.name,'background: #07dc11; color: #FFF');

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

    var animateSplashScreen = function(resolve,reject){
        $('#splashscreen').addClass('animated').addClass('slideOutUp').on('animationend', function () {

            $('#splashscreen').css({'display': 'none'}); // because the animation library does not reset this property

            $('#container').css('display', 'block').addClass('animated').addClass('slideInUp');

            // Add message waiting for players
            $('#vs .messages').html('<p class="waiting waitingpulse animated pulse">Waiting for players</p>');
            resolve(); // there is no reject in this case?
        });
    };
    var checkPlayerLogin = function(currentGame){
        return function(player){
            // Check if in Game.players already
            if (
                currentGame.players.find((p) => {
                    return p.id === player.id
                }) === undefined

            ) {
                // Add if not and consider it the first player
                currentGame.players.push(new Player(player.id,
                                                    player.name,
                                                    player.health * config.healthFactor,
                                                    'player'+(currentGame.players.length + 1) ));

                verbose.log('--- INFO --- player processed',player.name);

                // Check how many players there are now
                if(currentGame.players.length === 1){
                    $('#player1 .ready').css('display', 'inline-block');
                    $('#player2 .hurry').show();
                } else {
                    // The second player has been added, move to the next screen
                    $('#player2 .hurry').hide();
                    $('#player2 .ready').css('display', 'inline-block');

                    // Start animation new screen
                    initRound();

                    // TODO: Can I break a function here so that poll() is not invoked later on? return just breaks me out of the foreach... or do I need to result to a for?
                    return;
                }

            }
        }
    };

    var initRound = function(){
        verbose.log('--- INFO --- Initialising game');



    };




    var pollForChanges = function(){

    };

    var showCountDown = function () {
        setInterval(function () {
            var t = helperFunctions.getTimeRemaining(config.battleDuration);
            $('.timer time').html('0' + t.minutes + ':' + t.seconds);
        }, 1000);
    };

    var generateBoxes = function () {
        for (var i = 0; i < config.amountOfBoxes; i++) {
            currentGame.boxes.push(new Box(i));
        }

        var index = 0;
        var movingBoxAnimation = setInterval(function () {
            currentGame.boxes[index].animate();

            // Bind animation ended -> move to start position
            currentGame.boxes[index].$htmlelement.on('transitionend', function (escapedIndex) {
                return function () {
                    currentGame.boxes[escapedIndex].moveToStartPosition.call(currentGame.boxes[escapedIndex])
                }
            }(index)); // Escape the closure my sweeties!

            if (index < config.amountOfBoxes - 1) {
                index++;
            } else {
                clearInterval(movingBoxAnimation);
            }

        }, 760);

    };
    var getRandomBox = function(){
        var randomIndex = helperFunctions.getRandomInt(0,currentGame.boxes.length -1);
        var randomBox = currentGame.boxes[randomIndex];
        if(!randomBox.visible){getRandomBox();}

        return randomBox.$htmlelement;
    };

    var selectItemBox = function (player, selectedBox) {

        // This is how we kill a CSS transition in JS http://stackoverflow.com/questions/11131875/what-is-the-cleanest-way-to-disable-css-transition-effects-temporarily
        // But I didn't need it in the end - keeping this for future reference
        /* $('#item-3').addClass('killtransition');
         $('#item-3').css({'right':'50%','top':'200px'});
         $('#item-3')[0].offsetHeight;*/

        // Make a new box

        $(selectedBox).attr('src', 'images/item-selected.svg').addClass('animated').addClass('zoomOutDown').addClass('selected');
        itemSelectedAudio.play();
        addItemToPlayerCollection(player);
    };

    var addItemToPlayerCollection = function (player) {
        var collected = parseInt($(player).find('.itemcollection strong').text());
        $(player).find('.itemcollection .activeitem').css('visibility', 'visible')
        $(player).find('.itemcollection strong').text(collected + 1)
    };

    var unselectItemBox = function (action) {
        // TODO: fix set it to the right box, now I've reset all boxes because it doesn't really matter
        $('.wrapper img').attr('src', 'images/item.svg').removeClass('selected').removeClass('zoomOutDown').removeClass('animated');

        removeItemFromPlayerCollection('#'+currentGame.getPlayerById(action.player).htmlId); // Format #player2
    };
    var fireItem = function (action) {

    };
    var removeItemFromPlayerCollection = function (player) {
        $(player).find('.itemcollection .activeitem').css('visibility', 'hidden')
    };


    /********  SPECIAL ACTION FUNCTIONS **********/

        // I will need to turn these guys into promises, but that's a worry for tomorrow
    var fetchAmmo = function(action){
        verbose.log('%c --- AMMO --- for ' + currentGame.getPlayerById(action.player).htmlId,'background: #222; color: #bada55');
        selectItemBox('#'+currentGame.getPlayerById(action.player).htmlId, getRandomBox());
    };

    var fire = function(action){
        verbose.log('%c --- FIRE --- for ' + currentGame.getPlayerById(action.player).htmlId + ' with ' + action.value.hit + ' damage','background: #F00; color: #FFF');
        fireItem(action);
        unselectItemBox(action);
    };

    var takeHit = function(action){
        var currentPlayer = currentGame.getPlayerById(action.player);
        var damageDealer = (currentPlayer.htmlId === 'player1')?1:0; // Ok this is really bad, but ideally the server would send who dealt the damage I am now passing the index in the array
        verbose.log('%c --- HIT --- for ' + currentPlayer.htmlId + ' with ' + action.value + ' damage','background: #0FF; color: #FFF');
        currentPlayer.animateHealth(action.value * config.healthFactor, $('#'+currentPlayer.htmlId + ' figure').siblings('.healthbar').find('.visible-bar'),currentGame,damageDealer);
    };


    return {
        init: init,
        fetchAmmo: fetchAmmo,
        fire: fire,
        takeHit: takeHit
    }

})();





$(document).ready(function () {
    interfaceModule.init();
});