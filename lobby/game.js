/* globals angular */
(function(){
"use strict";

angular.module("snake")
.controller("game", ["$rootScope", "$stateParams", "$injector", function($rootScope, params, $injector){
	$rootScope.showGame = true;

	var settings = JSON.parse(params.settings);
	if(settings.local){
		window.game.startGame(settings);
	}else{
		$injector.invoke(["netcode", function(netcode){
			window.game.startGame(settings, netcode);
		}]);
	}

	setTimeout(function(){
		document.getElementById("game").children[0].focus();
	}, 10);
}]);

})();