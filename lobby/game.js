/* globals angular */
(function(){
"use strict";

angular.module("lobby")
.controller("game", ["$stateParams", "$injector", "$scope", "$state", "games", function(params, $injector, $scope, $state, games){
	var settings = JSON.parse(params.settings);
	var players = JSON.parse(params.players);
	settings.players = players;

	$scope.game = games.snake.folder;

	$scope.$on("$viewContentLoaded", function(){
		var game = document.getElementById("game");
		game.focus();

		game.addEventListener("load", function(){
			console.log("onload fire");
			var engine = game.contentWindow.game;
			if(settings.local){
				engine.startGame(settings);
			}else{
				$injector.invoke(["netcode", function(netcode){
					engine.startGame(settings, netcode);
				}]);
			}

			engine.event.once("gameEnd", function(data){
				data.name = settings.name;
				$state.go("scoreboard", {
					data: JSON.stringify(data),
					local: !!settings.local
				});
			});
		}, false);
	});
}]);

})();