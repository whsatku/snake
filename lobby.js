/* globals angular */
(function(){
"use strict";

var app = angular.module("snake", ["ui.router"]);

app.config(["$stateProvider", function($stateProvider){
	$stateProvider.state("mainmenu", {
		templateUrl: "templates/mainmenu.html"
	});
	$stateProvider.state("lobby", {
		templateUrl: "templates/lobby.html",
		controller: "lobby",
		params: ["local"]
	});
}]);

app.filter("snakeColor", function(){
	return function(input){
		var map = ["?", "Green", "Yellow", "Red", "Fuchsia", "Cerulean", "Aquamarine"];
		return map[parseInt(input, 10)];
	};
});

app.filter("yesno", function(){
	return function(input){
		return input ? "Yes" : "No";
	};
});

app.controller("lobby", ["$scope", "$stateParams", function($scope, params){
	$scope.lobbySettings = {
		players: [null, null, null, null, null, null],
		fragLimit: 10,
		scoreLimit: 20,
		itemLimit: 100,
		perk: true,
		map: "plain",
		name: ""
	};

	$scope.playerIndex = -1;
	$scope.local = params.local === "1";

	if($scope.local){
		$scope.playerIndex = 0;
		$scope.lobbySettings.name = "Single player";
		$scope.lobbySettings.players[0] = {
			name: "User",
			color: 1,
			ready: true
		};
	}

	$scope.currentPlayer = $scope.lobbySettings.players[$scope.playerIndex];
}]);

app.run(["$state", function($state){
	$state.go("mainmenu");
}]);

})();