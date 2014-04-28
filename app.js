/* globals angular */
(function(){
"use strict";

var app = angular.module("snake", ["ui.router", "ui.bootstrap.modal"]);

app.config(["$stateProvider", function($stateProvider){
	$stateProvider.state("mainmenu", {
		templateUrl: "template/mainmenu.html"
	}).state("lobby", {
		templateUrl: "template/lobby.html",
		controller: "lobby",
		params: ["local"]
	}).state("lobby.create", {
		controller: "lobbycreate"
	}).state("lobby.join", {
		controller: "lobbyjoin",
		params: ["id", "local"]
	}).state("browse", {
		templateUrl: "template/browse.html",
		controller: "browse"
	}).state("game", {
		template: " ",
		controller: "game",
		params: ["settings", "players"]
	}).state("scoreboard", {
		templateUrl: "template/scoreboard.html",
		controller: "scoreboard",
		params: ["data", "local"]
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

app.filter("ucfirst", function(){
	return function(input){
		return input.charAt(0).toUpperCase() + input.slice(1);
	};
});

app.factory("netcode", function(){
	var netcode = new Netcode();
	netcode.connect();
	return netcode;
});

app.factory("handleRtcKey", ["netcode", function(){
	return function($scope){
		var onKeyDown = function(e){
			if(e.which == 86){
				netcode.rtc.muteMic(false);
			}
		};

		var onKeyUp = function(e){
			if(e.which == 86){
				netcode.rtc.muteMic(true);
			}
		};

		document.addEventListener("keydown", onKeyDown, false);
		document.addEventListener("keyup", onKeyUp, false);

		$scope.$on("$destroy", function(){
			document.removeEventListener("keydown", onKeyDown, false);
			document.removeEventListener("keyup", onKeyUp, false);
			netcode.rtc.muteMic(true);
		});
	};
}]);

app.run(["$state", function($state){
	$state.go("mainmenu");
}]);

})();