/* globals angular */
(function(){
"use strict";

angular.module("snake")
.controller("scoreboard", ["$scope", "$stateParams", "$injector", function($scope, params, $injector){
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
