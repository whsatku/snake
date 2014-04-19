/* globals angular */
(function(){
"use strict";

angular.module("snake")
.controller("browse", ["$scope", "netcode", function($scope, netcode){
	$scope.lobby = [];

	netcode.send({command: "lobbylist"});

	var onMotd = function(motd){
		$scope.$apply(function(){
			$scope.motd = motd;
		});
	};
	var onOnline = function(online){
		$scope.$apply(function(){
			$scope.online = online;
		});
	};
	var onConnected = function(connected){
		$scope.$apply(function(){
			$scope.connected = connected;
		});
	};
	var onData = function(data){
		$scope.$apply(function(){
			if(data.lobby){
				$scope.lobby = data.lobby;
			}
		});
	};

	$scope.motd = netcode.motd;
	$scope.online = netcode.online;
	$scope.connected = netcode.connected;

	netcode.on("motd", onMotd);
	netcode.on("online", onOnline);
	netcode.on("connected", onConnected);
	netcode.on("data", onData);

	$scope.$on("$destroy", function(){
		netcode.off("motd", onMotd);
		netcode.off("online", onOnline);
		netcode.off("connected", onConnected);
		netcode.off("data", onData);
	});
}]);

})();