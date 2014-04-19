/* globals angular */
(function(){
"use strict";

angular.module("snake")
.controller("game", ["$rootScope", "$stateParams", function($rootScope, params){
	$rootScope.showGame = true;

	var settings = JSON.parse(params.settings);
	window.game.startGame(settings);

	setTimeout(function(){
		document.getElementById("game").children[0].focus();
	}, 10);
}]);

})();