/* globals angular */
(function(){
"use strict";

angular.module("snake")
.controller("lobby", ["$scope", "$stateParams", "$state", "$injector", function($scope, params, $state, $injector){
	$scope.lobbySettings = {
		fragLimit: 10,
		scoreLimit: 20,
		itemLimit: 100,
		perk: true,
		map: "plain",
		name: ""
	};
	$scope.players = [null, null, null, null, null, null];

	$scope.playerIndex = -1;
	$scope.lobbySettings.local = params.local === "1";
	$scope.ready = false;

	if($scope.lobbySettings.local){
		$scope.playerIndex = 0;
		$scope.lobbySettings.name = "Single player";
		$scope.players[0] = {
			name: localStorage.playerName || "User",
			color: 1,
			ready: true
		};
		$scope.ready = true;
	}

	$scope.currentPlayer = $scope.players[$scope.playerIndex];

	$scope.startGame = function(){
		$state.go("game", {settings: JSON.stringify($scope.lobbySettings)});
	};

	$scope.$watch("players", function(){
		$scope.ready = $scope.players.every(function(item){
			return item === null || item.ready;
		});
	}, true);

	$scope.$watch("currentPlayer.ready", function(value){
		if(value && $scope.currentPlayer.name.length === 0){
			$scope.currentPlayer.ready = false;
		}
	});

	$scope.$watch("currentPlayer.name", function(value){
		value = value || "";
		localStorage.playerName = value;

		if(value.length === 0 && false){
			$scope.currentPlayer.ready = false;
		}
	});

	if(!$scope.lobbySettings.local){
		var initialPlayerName = localStorage.playerName;
		$injector.invoke(["netcode", "$timeout", function(netcode, $timeout){
			var hasInitialData = false;
			var inServerSend = false;

			var onData = function(data){
				if(!hasInitialData && data.players !== undefined){
					netcode.send({command: "user", user: {
						name: initialPlayerName || "User"
					}});
					hasInitialData = true;
					return;
				}
				inServerSend = true;
				$scope.$apply(function(){
					if(data.playerIndex !== undefined){
						$scope.playerIndex = data.playerIndex;
					}
					if(data.settings !== undefined){
						$scope.lobbySettings = data.settings;
					}
					if(data.players !== undefined){
						$scope.players = data.players;
						while($scope.players.length < 6){
							$scope.players.push(null);
						}
						$scope.currentPlayer = $scope.players[$scope.playerIndex];
					}
					if(data.state === Netcode.Const.LobbyState.WAIT_FOR_LOAD){
						$scope.startGame();
					}
				});
				$timeout(function(){
					inServerSend = false;
				});
			};
			netcode.on("data", onData);

			$scope.$watch("currentPlayer", function(value, oldValue){
				if(inServerSend || value === undefined || oldValue === undefined){
					return;
				}
				if(value.name != oldValue.name || value.color != oldValue.color){
					netcode.send({command: "user", user: {
						name: value.name,
						color: value.color
					}});
				}
			}, true);

			$scope.$watch("currentPlayer.ready", function(value){
				if(inServerSend || value === undefined){
					return;
				}
				netcode.send({command: "ready", ready: value});
			});

			var leaveToGame = false;

			$scope.$on("$destroy", function(){
				netcode.off("data", onData);
				if(leaveToGame){
					return;
				}
				netcode.send({command: "lobbyleave"});
			});

			var origStartGame = $scope.startGame;
			$scope.startGame = function(){
				leaveToGame = true;
				if($scope.playerIndex === 0){
					netcode.send({command: "lobbystart"});
				}
				origStartGame();
			};
		}]);
	}
}]);

/**
 * Used when creating lobby in multiplayer
 */
angular.module("snake")
.controller("lobbycreate", ["$scope", "netcode", function($scope, netcode){
	netcode.send({command: "lobbycreate"});
}]);

/**
 * Used when joining lobby in multiplayer
 */
angular.module("snake")
.controller("lobbyjoin", ["$scope", "$stateParams", "netcode", function($scope, params, netcode){
	netcode.send({command: "lobbyjoin", lobby: params.id});
}]);

})();