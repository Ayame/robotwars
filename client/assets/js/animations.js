/**
 * Created by jillvandendriessche on 26/06/17.
 */


var interfaceAnimatorModule = (function(){

    var animateSplashScreen = function(resolve,reject){
        $('#splashscreen').addClass('animated').addClass('slideOutUp').on('animationend', function () {

            $('#splashscreen').css({'display': 'none'}); // because the animation library does not reset this property

            $('#container').css('display', 'block').addClass('animated').addClass('slideInUp');

            // Add message waiting for players
            $('#vs .messages').html('<p class="waiting waitingpulse animated pulse">Waiting for players</p>');
            resolve(); // there is no reject in this case
        });
    };

    var initRound = function(){
        verbose.log('%c --- INFO --- initialising round 1' ,'background: #f9890e; color: #FFF');

        // Fade necessary boxes
        $('.messages p').removeClass('waitingpulse').removeClass('pulse');
        var animateRoundPromise = new Promise(animateRoundInitiation);
        animateRoundPromise.then(function(){
            // Yeah yeah can be optimised for more players but not now
            interfaceModule.getCurrentGame().players.forEach(function(p){
                p.fillOutHealth($('#'+ p.htmlId +' .healthbar h3 span'),p.health)
            });
        });
    };

    var animateRoundInitiation = function (resolve,reject){
        $('.ready, .messages p').addClass('animated').addClass('fadeOut');

        $('.messages p').on('animationend',function () {
            $('.ready,.hurry').css('display','none');
            $('.messages p').remove();

            // Bring back the boxes
            $('aside,.healthbar,.itemcollection').css('display','block').addClass('animated').addClass('fadeInUp');
            generateBoxes();

            showCountDown();
            resolve();
        });
    };

    var showCountDown = function () {
        var battleTimer = setInterval(function () {
            var t = helperFunctions.getTimeRemaining(config.battleDuration);
            $('.timer time').html('0' + t.minutes + ':' + t.seconds);

            // Check if the time hasn't run out
            if(t.minutes <= 0 && t.seconds <= 0){
                // time ran out
                clearInterval(battleTimer);
                interfaceModule.battleTimeUp();
            }

        }, 1000);
    };

    var generateBoxes = function () {
        for (var i = 0; i < config.amountOfBoxes; i++) {
            interfaceModule.getCurrentGame().boxes.push(new Box(i));
        }
        boxScrollAnimation();
    };


    var boxScrollAnimation = function(){
        var currentGame = interfaceModule.getCurrentGame();
        var index = 0;
        var movingBoxAnimation = setInterval(function(){
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

    // Requires player object (player selecting the ammo) and select random box from belt
    var selectItemBox = function (player, selectedBox) {

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
        removeItemFromPlayerCollection('#'+interfaceModule.getCurrentGame().getPlayerById(action.player).htmlId); // Format #player2
    };

    var removeItemFromPlayerCollection = function (player) {
        $(player).find('.itemcollection .activeitem').css('visibility', 'hidden')
    };

    // requires socket action object
    var fireItem = function (action) {
        var player = interfaceModule.getCurrentGame().getPlayerById(action.player).htmlId;

        // Need to receive item type from server
        $('.messages').html('<p class="' + player + '">' + $('#'+player).find('figcaption').text() + ' fired a <span>'+ action.value.hit +'</span> damage <span>bullet</span>!</p>').show().addClass('animated').addClass('flash');
        laserBeamAudio.play();
    };

    var showPlayerStatus = function($showElement,showHurryBox){
       $showElement.css('display', 'inline-block');
       (showHurryBox) ? $('#player2 .hurry').show() : $('#player2 .hurry').hide() ;
    };


    var finishHim = function(winner,loser){
        // Finish him Animation first -> followed by game over screen

        // Hide unnecessary boxes for focus
        $('#vs,.itemcollection').addClass('animated').addClass('fadeOut');

        $('.finishhim').css('display','block').addClass('animated').addClass('bounceInUp').on('animationend',function(){
            $('#' + winner.htmlId + ' figure').addClass('movetokill').on('transitionend',function(){
                $('#' + loser.htmlId + ' figure').addClass('killed').on('transitionend',function(){
                    tumDumAudio.play();
                    $('.finishhim,.healthbar').addClass('fadeOut');

                    // Show game over screen here
                    $('#gameover').css('display','flex').addClass('animate').addClass('slideInDown').find('p').addClass(winner.htmlId).children('strong').text(winner.name);

                });
            });
        });
    };

    return {
        initRound: initRound,
        selectItemBox: selectItemBox,
        unselectItemBox: unselectItemBox,
        fireItem: fireItem,
        animateSplashScreen: animateSplashScreen,
        showPlayerStatus: showPlayerStatus,
        finishHim: finishHim
    }
})();
