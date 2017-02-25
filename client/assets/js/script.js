/**
 * Created by jillvandendriessche on 22/02/17.
 */

var criticalHealthAudio = new Audio('assets/media/music/low-health.mp3');
var isPlaying = false;


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
    amountOfBoxes : 13
};


var interfaceModule = (function () {

    // Precentage health not to have rounding issues
    var health = {player1: 100, player2: 100};

    // Boxes collection
    var boxes = [];

    var init = function () {
        fillOutHealth($('#player1 .healthbar h3 span'),health.player1);
        fillOutHealth($('#player2 .healthbar h3 span'),health.player2);
        bindEvents();
        generateBoxes();
    };

    var generateBoxes = function(){
        for(var i= 0; i<config.amountOfBoxes; i++){
            boxes.push(new Box(i));
        }

        // Probleem dat hij het terugzetten telkens op hetzelfde element doet?
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




    var fillOutHealth = function ($target,newhealth) {
        $target.text(newhealth);
    };
    var bindEvents = function () {
        // listen to incoming stuff

        // fake some stuff for now

        // BEWARE::: when clicking make sure the animation has finished before clicking again,
        // otherwise the numbers won't add up
        // Naturally this will be irrelevant in the "live" version with incoming server data
        $('main figure').on('click', function (e) {
            animateHealth(10, $(this).siblings('.healthbar').find('.visible-bar'))
        });
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


$(document).ready(function () {
    interfaceModule.init();
});