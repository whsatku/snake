/* globals angular */
(function(){
"use strict";

angular.module("lobby")
.controller("scoreboard", ["$scope", "$stateParams", "$injector", function($scope, params, $injector){
	console.log(params);
	$scope.data = JSON.parse(params.data);
	
	if(params.local == "false"){
		$injector.invoke(["netcode", "handleRtcKey", function(netcode, handleRtcKey){
			handleRtcKey($scope);
			$scope.$on("$destroy", function(){
				netcode.rtc.disconnectAll();
			});
		}]);
	}
}]);

})();