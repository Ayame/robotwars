/**
 * Created by jillvandendriessche on 23/06/17.
 */


function Player(id, name, health,htmlId) {
    this.id = id;
    this.name = name;
    this.health = health;
    this.htmlId = htmlId;
}

Player.prototype.animateHealth = function (decrease, $target,currentGame,damageDealer) {

    // TEMP OVERRIDE
    //decrease *= 5;

    var $parent = $target.closest('.healthbar').parent();
    var playerIndex = parseInt($parent.attr('id').replace('player','')) - 1;
    //currentGame.players[playerIndex].health -= decrease / (config.droidHealth * 10) * 100;
    currentGame.players[playerIndex].health -= decrease; // health x/20, not percentage
    this.fillOutHealth($('#' + $parent.attr('id') + ' .healthbar h3 span'), currentGame.players[playerIndex].health);

    verbose.log('%c --- NEW HEALTH --- for ' + currentGame.players[playerIndex].name + ' is ' + currentGame.players[playerIndex].health,'background: #47cbf6; color: #FFF');

    var newWidth = $target.width() - decrease;
    $target.animate({width: newWidth}, 150, 'linear');

    var criticalWidth = Math.round(newWidth / $target.closest('.wrapper').width() * config.droidHealth);

    // Play audio
    hitAudio.play();

    // Show flickering image
    var $figure = $('#' + this.htmlId + ' figure');
    $figure.addClass('hit').on('animationend',function(){
        $figure.removeClass('hit');
    });

    // TEMP OVERRIDE
    //currentGame.players[playerIndex].health =-1;

    if (currentGame.players[playerIndex].health < config.criticalHealth) {

        $parent.children('.critical').css('visibility', 'visible');
        criticalHealthAudio.play();

        //verbose.log('%c --- CRITICAL CONDITION --- for ' + $parent.attr('id'),'background: #f97100; color: #FFF');

    }
    if (currentGame.players[playerIndex].health  < 0) {

        $parent.children('.critical').css('visibility', 'hidden');
        criticalHealthAudio.pause();
        finishHimAudio.play();

        this.fillOutHealth($('#' + $parent.attr('id') + ' .healthbar h3 span'), 0);

       interfaceAnimatorModule.finishHim(currentGame.players[damageDealer],currentGame.players[playerIndex] );
      interfaceModule.triggerGameOver(config.gameId,currentGame.players[damageDealer]);
    }
};

Player.prototype.fillOutHealth = function ($target, newhealth) {
    $target.text(newhealth);
};
