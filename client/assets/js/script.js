/**
 * Created by jillvandendriessche on 22/02/17.
 */

var criticalHealthAudio = new Audio('assets/media/music/low-health.mp3');
var laserBeamAudio = new Audio('assets/media/music/laser-fired.mp3');
var itemSelectedAudio = new Audio('assets/media/music/item-selected.mp3');

var isPlaying = false;

function Game(started,ended,players){
    this.started = started;
    this.ended = ended;
    this.players = players;
}

function Player(id,name,health){
    this.id = id;
    this.name = name;
    this.health = health;
}

function Box(id){
    this.src = 'images/item.svg';
    this.selected = false;
    this.id = id;

    this.addToHTML();
}

Box.prototype.animate = function(){
   // $('#item-' + this.id).addClass('animateImg');
    this.$htmlelement.addClass('animateImg');
    return this;
};

Box.prototype.addToHTML = function(){
    $('aside .wrapper').append('<img src="'+ this.src +'" alt="Collectible" title="Collectible" id="item-'+ this.id +'" />');
    this.$htmlelement = $('#item-' + this.id);
    return this;
};

Box.prototype.moveToStartPosition = function(){console.log(this);
   // this.$htmlelement.css('right','-95px').removeClass('animateImg').addClass('animateImg'); // This makes them turn around and go back, really cool and unexpected!
    this.$htmlelement.removeClass('animateImg');
    void this.$htmlelement[0].offsetWidth; // Some magic I found on https://css-tricks.com/restart-css-animation/
    this.$htmlelement.addClass('animateImg');
    console.log('animation ended with position ' + this.$htmlelement.css('right'))

    return this;
};

var config = {
    // Droids have 20 health points, we should receive this from the server ideally
    droidHealth: 20,

    // When only 5 lives are left, critical mode is enforced
    criticalHealth: 5,

    // Amount of boxes to be generated in the bullet belt
    amountOfBoxes : 13,

    // Standard 10 mins of battle time
    battleDuration : new Date(Date.parse(new Date()) +  10 * 60 * 1000),

    // Default first game ID
    startGameId: 1,

    // Webservice url
    serverUrl: 'http://localhost:3000'

};


var interfaceModule = (function () {

    // Precentage health not to have rounding issues
    var health = {player1: 100, player2: 100};

    // Boxes collection
    var boxes = [];

    var currentGame = {};

    var init = function () {

        // Show intro for a second -> fade to waiting screen (CSS animation triggered)

        setTimeout(function(){

            $('#splashscreen').addClass('animated').addClass('slideOutUp');

            $('#splashscreen').on('animationend',function(){

                $('#splashscreen').css({'display':'none'}); // because the animation library does not reset this property

                $('#container').css('display','block').addClass('animated').addClass('slideInUp');

                // Add message waiting for players
                $('#vs .messages').html('<p class="waiting animated pulse">Waiting for players</p>');

                // Get game from server with all its info
                getCurrentGame();

               // fillOutHealth($('#player1 .healthbar h3 span'),health.player1);
               // fillOutHealth($('#player2 .healthbar h3 span'),health.player2);
                bindEvents();

                //generateBoxes(); Add later
               // showCountDown(); Add later
            });

        },1500); // Stick to 1500ms to allow for initial animation to finish


    };

    var getCurrentGame = function(){
        $.ajax({
            url: config.serverUrl + '/game',
            method: 'GET'
        }).done(function(response){
            console.log(response);
        });
    };

    var showCountDown = function(){
        setInterval(function(){
            var t = helperFunctions.getTimeRemaining(config.battleDuration);
            $('.timer time').html('0' + t.minutes +':'+ t.seconds );
        }, 1000);
    };

    var generateBoxes = function(){
        for(var i= 0; i<config.amountOfBoxes; i++){
            boxes.push(new Box(i));
        }

        var index = 0;
        var movingBoxAnimation = setInterval(function(){
            boxes[index].animate();

            // Bind animation ended -> move to start position
            boxes[index].$htmlelement.on('transitionend',function(escapedIndex){
                return function(){
                   boxes[escapedIndex].moveToStartPosition.call(boxes[escapedIndex])
                }
            }(index)); // Escape the closure my sweeties!

            if(index<config.amountOfBoxes - 1){
                index++;
            } else {
                clearInterval(movingBoxAnimation);
            }

        },760);

    };

    var selectItemBox = function(player,selectedBox){

        // This is how we kill a CSS transition in JS http://stackoverflow.com/questions/11131875/what-is-the-cleanest-way-to-disable-css-transition-effects-temporarily
        // But I didn't need it in the end - keeping this for future reference
       /* $('#item-3').addClass('killtransition');
        $('#item-3').css({'right':'50%','top':'200px'});
        $('#item-3')[0].offsetHeight;*/

       // Select a random visible box to light up shortly (visibility kan je opvragen aan het object zelf, alles boven bepaalde right pos )
           // -> "oplichten" en er een cijfer inzetten
           // Bij buiten scherm gaan terug resetten van form
       // Make a new box

        $(selectedBox).attr('src','images/item-selected.svg').addClass('animated').addClass('zoomOutDown');
        itemSelectedAudio.play();
        addItemToPlayerCollection(player);
    };

    var addItemToPlayerCollection = function(player){
        var collected = parseInt($(player).find('.itemcollection strong').text());
        $(player).find('.itemcollection .activeitem').css('visibility','visible')
        $(player).find('.itemcollection strong').text(collected+1)
    };

    var unselectItemBox = function(player){
        $('#item-3').attr('src','images/item.svg');
        removeItemFromPlayerCollection(player);
    };
    var fireItem = function(player){

        // Need to receive item type from server
        $('.messages').html('<p class="'+  player.substr(1) +'">'+ $(player).find('figcaption').text() +' fired a <span>3</span> damage <span>bullet</span>!</p>').show().addClass('animated').addClass('flash');
        laserBeamAudio.play();
    };
    var removeItemFromPlayerCollection = function(player){
        $(player).find('.itemcollection .activeitem').css('visibility','hidden')
    };

    var fillOutHealth = function ($target,newhealth) {
        $target.text(newhealth);
    };
    var bindEvents = function () {
        // listen to incoming stuff

        // fake some stuff for now

        // BEWARE::: when clicking make sure the animation has finished before clicking again,
        // otherwise the numbers won't add up
        // Naturally this will be irrelevant in the "live" version with incoming server data
        // FAKE: click
        $('main figure').on('click', function (e) {
            animateHealth(10, $(this).siblings('.healthbar').find('.visible-bar'))
        });

        // FAKE: click will always go to player 2
        $('aside').on('click', ' .wrapper img',function(e){selectItemBox('#player2',$(this));})

        // FAKE: take away animation from selectedItem
        $('#player2').on('click',function(e){
            unselectItemBox('#player2');
            fireItem('#player2');
        })
    };

    var animateHealth = function (decrease, $target) {

        var $parent = $target.closest('.healthbar').parent();
        health[$parent.attr('id')] -=  decrease / 200 * 100;
        fillOutHealth($('#' + $parent.attr('id') +' .healthbar h3 span'),health[$parent.attr('id')]);

        var newWidth = $target.width() - decrease;
        $target.animate({width: newWidth}, 150, 'linear');

        var criticalWidth = Math.round(newWidth / $target.closest('.wrapper').width() * config.droidHealth);

        if (criticalWidth < config.criticalHealth) {

            $parent.children('.critical').css('visibility', 'visible');
            criticalHealthAudio.play();

            console.log('WARNING: ' + $parent.attr('id') + ' is in critical condition!')
        }
        if (criticalWidth < 0) {

            $parent.children('.critical').css('visibility', 'hidden');
            criticalHealthAudio.pause();
            fillOutHealth($('#' + $parent.attr('id') +' .healthbar h3 span'),0);

            // Trigger "died" event here

        }
    };

    var animateBox = function(){

    };

    return {
        init: init
    }

})();

var dataRetriever = (function () {

    return {};
})();


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
    return {getTimeRemaining: getTimeRemaining};
})();



$(document).ready(function () {
    interfaceModule.init();
});