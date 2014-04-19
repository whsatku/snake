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
	$stateProvider.state("game", {
		template: " ",
		controller: "game",
		params: ["settings"]
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

app.controller("lobby", ["$scope", "$stateParams", "$state", function($scope, params, $state){
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
	$scope.lobbySettings.local = params.local === "1";
	$scope.ready = false;

	if($scope.lobbySettings.local){
		$scope.playerIndex = 0;
		$scope.lobbySettings.name = "Single player";
		$scope.lobbySettings.players[0] = {
			name: localStorage.playerName || "User",
			color: 1,
			ready: true
		};
		$scope.ready = true;
	}

	$scope.currentPlayer = $scope.lobbySettings.players[$scope.playerIndex];

	$scope.startGame = function(){
		$state.go("game", {settings: JSON.stringify($scope.lobbySettings)});
	};

	$scope.$watch("lobbySettings.players", function(){
		$scope.ready = $scope.lobbySettings.players.every(function(item){
			return item === null || item.ready;
		});
	}, true);

	$scope.$watch("currentPlayer.name", function(value){
		localStorage.playerName = value;
	});
}]);

app.controller("game", ["$rootScope", "$stateParams", function($rootScope, params){
	$rootScope.showGame = true;

	var settings = JSON.parse(params.settings);
	window.game.startGame(settings);

	setTimeout(function(){
		document.getElementById("gameCanvas").focus();
	}, 10);
}])

app.run(["$state", function($state){
	$state.go("mainmenu");
}]);

})();