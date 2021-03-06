function makeUrl(gameId,playerId){
    if (playerId)
        return "http://localhost:3000/game/"+gameId+"/player/"+playerId;
    else
        return "http://localhost:3000/game/"+gameId;
}

function success(data){
    $("#log").prepend("<li>response:"+JSON.stringify(data)+"</li>");
}

function fail(data){
    $("#log").prepend("<li>fail:"+JSON.stringify(data)+"</li>");
}

function registerPlayer(gameId){
    $.post( makeUrl(gameId)+"/player", {}, success).fail(fail);
}

function requestAmmo(gameId,playerId){
    $.get( makeUrl(gameId,playerId)+"/ammo", success).fail(fail);
}

function fire(gameId,playerId){
    $.post( makeUrl(gameId,playerId)+"/ammo", success).fail(fail);
}

function registerHit(gameId,playerId){
    $.post( makeUrl(gameId,playerId)+"/hit", success).fail(fail);
}

$(()=>{
	console.log("loaded");
    $log = $("#log");
	$("#actions").submit(function(evt){
	    evt.preventDefault();
		var game = $("#game").val();
        var player = $("#player").val();
        var action = $("#action").val();
        $log.prepend("<li>"+["submit",game,player,action].join(" ")+"</li>");

        switch (action) {
            case "registerplayer": registerPlayer(game); break;
            case "requestammo"   : requestAmmo(game,player); break;
            case "fire"          : fire(game,player); break;
            case "registerhit"   : registerHit(game,player); break;
            default: $log.append("<li>ukn command</li>");
        }



	});
});