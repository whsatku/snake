/* globals angular */
(function(){
"use strict";

angular.module("snake")
.controller("scoreboard", ["$scope", "$stateParams", function($scope, params){
	$scope.data = JSON.parse(params.data);
}]);

})();