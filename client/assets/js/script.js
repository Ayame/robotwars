/**
 * Created by jillvandendriessche on 22/02/17.
 */

var criticalHealthAudio = new Audio('assets/media/music/low-health.mp3');
var laserBeamAudio = new Audio('assets/media/music/laser-fired.mp3');
var itemSelectedAudio = new Audio('assets/media/music/item-selected.mp3');
var hitAudio = new Audio('assets/media/music/hit.mp3');
var finishHimAudio = new Audio('assets/media/music/finishhim.mp3');
var tumDumAudio = new Audio('assets/media/music/tum-dum-dum.mp3');

var config = {
    // Droids have 20 health points, we should receive this from the server ideally
    droidHealth: 20,

    // When only 5 lives are left, critical mode is enforced
    criticalHealth: 5,

    // Amount of boxes to be generated in the bullet belt
    amountOfBoxes: 13,

    // Standard 10 mins of battle time
    battleDuration: new Date(Date.parse(new Date()) + 10 * 60 * 1000),

    // Default first game ID
    gameId: 0,

    // Webservice url
    serverUrl: 'http://localhost:3000',

    // Show console messages
    verbose: true,

    // Mulitply health by this value to gain percentage health and avoid calculations all throughout the application
    healthFactor: 5


};

var GUI = {

    // Show intro for a second -> fade to waiting screen (CSS animation triggered)
    showIntroAndFaceToWaitingScreen : function (done) {
        $('#splashscreen').addClass('animated').addClass('slideOutUp').on('animationend', function () {

            $('#splashscreen').css({'display': 'none'}); // because the animation library does not reset this property

            $('#container').css('display', 'block').addClass('animated').addClass('slideInUp');

            // Add message waiting for players
            $('#vs .messages').html('<p class="waiting waitingpulse animated pulse">Waiting for players</p>');

            done();
        });

    }

};


var interfaceModule = (function () {

    var currentGame = new Game(false,false);

    var lastProcessedTimestamp= 0;
    var firstActionsLoad = true;

    var init = function () {
        setTimeout(function() { GUI.showIntroAndFaceToWaitingScreen( pollForChanges ) },
            1500); // Stick to 1500ms to allow for initial animation to finish
    };

    var initRound = function(){
        verbose.log('--- INFO --- Initialising game');

        //TODO: Should be called after ALL animations have ended - but that's a worry for later
        // Fade necessary boxes
        $('.messages p').removeClass('waitingpulse').removeClass('pulse');
        $('.ready, .messages p').addClass('animated').addClass('fadeOut');

        $('.messages p').on('animationend',function () {
            $('.ready,.hurry').css('display','none');
            $('.messages p').remove();

            // Bring back the boxes
            $('aside,.healthbar,.itemcollection').css('display','block').addClass('animated').addClass('fadeInUp');
            generateBoxes();

            showCountDown();
        });

        // Yeah yeah can be optimised for more players but not now
        currentGame.players.forEach(function(p){
            p.fillOutHealth($('#'+ p.htmlId +' .healthbar h3 span'),p.health)
        });
         //fillOutHealth($('#player1 .healthbar h3 span'),currentGame.players[0].health);

    };

    var pollActions = (function(){
        var processedActions = 0;


        return function(cb){
            verbose.log('--- INFO --- pollActions ');
            $.ajax({
                url: config.serverUrl + '/game/' + config.gameId,
                method: 'GET',
                dataType: 'json'
            }).done(function (response) {
                var actions = response.logs;
                var res = [];
                for(let i=processedActions; i<actions.length ; i++){
                    res.push(actions[i]);
                }
                processedActions = actions.length;
                cb(res);
            });
        };
    })();

    var pollForChanges = function(){
        // IIFE for scope
        (function pollRound() {
            verbose.log('--- INFO --- pollRound ');

            function doAction(action,actionIndex,actions){

                if (action.player && currentGame.getPlayerById(action.player)){
                    verbose.log('--- INFO --- Handling action ' + action.action + ' by player ' + currentGame.getPlayerById(action.player).name);

                } else {
                    verbose.log('--- INFO --- Handling action ' + action.action + ' (no player)');
                }

                // Now do something with them
                var interfaceModuleActionHandler = interfaceModule[action.action]
                if (interfaceModuleActionHandler) interfaceModuleActionHandler(action);
                else verbose.log('--- INFO --- No interfaceModuleActionHandler for ' + action.action);

                lastProcessedTimestamp = action.timestamp;

                // continue polling when last item has finished - put in the loop to ensure all other items have been processed
                // MDW @ Jill: is this needed? (forEach() executes the provided callback once for each element present in the array in ascending order.)
                if(actionIndex === actions.length -1){
                    console.log('--- INFO --- Final element in queue, repolling for new events');
                    pollRound();
                }
            }

            setTimeout(function () {
                pollActions( function(actions){
                    verbose.log('--- INFO --- pollActions: received : ' + actions.length);
                    if (actions.length<=0){
                        verbose.log('--- INFO --- Nothing new, repolling for new events');
                        pollRound();
                    } else {
                        actions.forEach(doAction);
                    }
                } );

            }, 2000);
        })();
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
        //$('#item-3').attr('src', 'images/item.svg');

        // TODO: fix set it to the right box, now I've reset all boxes because it doesn't really matter
        $('.wrapper img').attr('src', 'images/item.svg').removeClass('selected').removeClass('zoomOutDown').removeClass('animated');

        removeItemFromPlayerCollection('#'+currentGame.getPlayerById(action.player).htmlId); // Format #player2
    };
    var fireItem = function (action) {
        var player = currentGame.getPlayerById(action.player).htmlId;

        // Need to receive item type from server
        $('.messages').html('<p class="' + player + '">' + $('#'+player).find('figcaption').text() + ' fired a <span>'+ action.value.hit +'</span> damage <span>bullet</span>!</p>').show().addClass('animated').addClass('flash');
        laserBeamAudio.play();
    };
    var removeItemFromPlayerCollection = function (player) {
        $(player).find('.itemcollection .activeitem').css('visibility', 'hidden')
    };


    /********  SPECIAL ACTION FUNCTIONS **********/

        // I will need to turn these guys into promises, but that's a worry for tomorrow
    var fetchAmmo = function(action){
       // verbose.log('%c --- AMMO --- for ' + currentGame.getPlayerById(action.player).htmlId,'background: #222; color: #bada55');
        selectItemBox('#'+currentGame.getPlayerById(action.player).htmlId, getRandomBox());
    };

    var fire = function(action){
      //  verbose.log('%c --- FIRE --- for ' + currentGame.getPlayerById(action.player).htmlId + ' with ' + action.value.hit + ' damage','background: #F00; color: #FFF');
        fireItem(action);
        unselectItemBox(action);
    };

    var takeHit = function(action){
        var currentPlayer = currentGame.getPlayerById(action.player);
        var damageDealer = (currentPlayer.htmlId === 'player1')?1:0; // Ok this is really bad, but ideally the server would send who dealt the damage I am now passing the index in the array
      //  verbose.log('%c --- HIT --- for ' + currentPlayer.htmlId + ' with ' + action.value + ' damage','background: #0FF; color: #FFF');
        currentPlayer.animateHealth(action.value * config.healthFactor, $('#'+currentPlayer.htmlId + ' figure').siblings('.healthbar').find('.visible-bar'),currentGame,damageDealer);
    };

    var identifyPlayer = function(action){
        verbose.log('--- INFO --- identifyPlayer ');
        var player = action.result;
        currentGame.players.push(new Player(player.id,
            player.name,
            player.health * config.healthFactor,
            'player'+(currentGame.players.length + 1) ));
        verbose.log('--- INFO --- identifyPlayer : player created ');

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
        }

    };

    return {
        identifyPlayer: identifyPlayer,
        init: init,
        fetchAmmo: fetchAmmo,
        fire: fire,
        takeHit: takeHit
    }

})();

// MDW: is this  used?
var dataRetriever = (function () {

    return {};
})();


var verbose = (function(logger){
    var log = function(){
        if(config.verbose){
            logger.log.apply(logger,arguments);
        }
    };
    return {
        log: log
    }
})(console);


var helperFunctions = (function () {
    function getTimeRemaining(endtime) {
        var t = Date.parse(endtime) - Date.parse(new Date());
        var seconds = Math.floor((t / 1000) % 60);
        var minutes = Math.floor((t / 1000 / 60) % 60);
        var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
        var days = Math.floor(t / (1000 * 60 * 60 * 24));
        return {
            'total': t,
            'days': days,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds
        };
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    return {
        getTimeRemaining: getTimeRemaining,
        getRandomInt: getRandomInt

    };
})();


$(document).ready(function () {
    interfaceModule.init();
});