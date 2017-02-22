/**
 * Created by jillvandendriessche on 22/02/17.
 */

var criticalHealthAudio = new Audio('assets/media/music/low-health.mp3');
var isPlaying = false;

var config = {
    // Droids have 20 health points, we should receive this from the server ideally
    droidHealth: 20,

    // When only 5 lives are left, critical mode is enforced
    criticalHealth: 5
};


var interfaceModule = (function () {

    // Precentage health not to have rounding issues
    var health = {player1: 100, player2: 100};


    var init = function () {
        fillOutHealth($('#player1 .healthbar h3 span'),health.player1);
        fillOutHealth($('#player2 .healthbar h3 span'),health.player2);
        bindEvents();
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