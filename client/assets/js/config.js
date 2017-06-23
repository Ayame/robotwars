/**
 * Created by jillvandendriessche on 23/06/17.
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
    //serverUrl: 'http://172.31.31.40:3000',
    serverUrl: 'http://localhost:3000',

    // Show console messages
    verbose: true,

    // Mulitply health by this value to gain percentage health and avoid calculations all throughout the application
    healthFactor: 5,

    socketMessages : {
        listenToGame : "listenToGame",
        gameLog : "gameLog",
        serverMsg : "serverMsg"
    }

};