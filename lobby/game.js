/* globals angular */
(function(){
"use strict";

angular.module("snake")
.controller("game", ["$rootScope", "$stateParams", "$injector", "$scope", "$state", function($rootScope, params, $injector, $scope, $state){
	$rootScope.showGame = true;

	var settings = JSON.parse(params.settings);
	var players = JSON.parse(params.players);
	settings.players = players;
	if(settings.local){
		window.game.startGame(settings);
	}else{
		$injector.invoke(["netcode", function(netcode){
			window.game.startGame(settings, netcode);
		}]);
	}

	window.game.event.once("gameEnd", function(data){
		data.name = settings.name;
		$state.go("scoreboard", {
			data: JSON.stringify(data),
			local: !!settings.local
		});
	});

	setTimeout(function(){
		document.getElementById("game").children[0].focus();
	}, 10);

	$scope.$on("$destroy", function(){
		$rootScope.showGame = false;
	});
}]);

})();