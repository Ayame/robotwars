/**
 * Created by jillvandendriessche on 23/06/17.
 */

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