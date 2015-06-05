 /****************************************************************************************
 *
 *  AUTHENTICATION CONTROLLER
 *  @version (.1)
 *  @date (2015)
 *
 *****************************************************************************************/
 define(['./module'], function (controllers) {
 	'use strict';
 	controllers.controller('authenticateCtrl', ['$scope','$rootScope','$state','userFactory','$log','$timeout',
 		function ($scope,$rootScope,$state,userFactory,$log,$timeout) {
 		$scope.loading = false;
 		//moved hard-coded user into the 
 		//app.run function located in app.js file
 		//$scope.userInfo = {};
	    $scope.missingData = false;
	    $scope.incorrectAuth = false;
 		$scope.registerUser = function() {
 			$log.info("authenticateCtrl - registerUser = " + JSON.stringify($rootScope.userInfo));
 			$scope.missingData = false;
	        if( $rootScope.userInfo.username.trim() === "" ||
	            $rootScope.userInfo.password.trim() === "" ||
	            $rootScope.userInfo.firstname.trim() === "" ||
	            $rootScope.userInfo.lastname.trim() === "" ||
	            $rootScope.userInfo.email.trim() === "" ||
	            $rootScope.userInfo.techId.trim() === "") 
	        {
	            $scope.missingData = true;
	            return;
	        }
	        var data = {
	            'username': $rootScope.userInfo.username,
	            'password': $rootScope.userInfo.password,
	            'firstname': $rootScope.userInfo.firstname,
	            'lastname': $rootScope.userInfo.lastname,
	            'email': $rootScope.userInfo.email,
	            'techId': $rootScope.userInfo.techId
	        };
	  		var promise = userFactory.registerUser(data);
	  		promise.then(function (data) {
	  			$log.info("authenticateCtrl - promise.registerUser = " + JSON.stringify(data));
            });
 		};
 		$scope.verifyUser = function() {
 			$log.info("authenticateCtrl - verifyUser = " + JSON.stringify($rootScope.userInfo));
	        var data = {
	            'username': $rootScope.userInfo.username,
	            'password': $rootScope.userInfo.password,
	        };
	  		var promise = userFactory.verifyUser(data);
	  		promise.then(function (data) {
	  			$log.info("authenticateCtrl - promise.verifyUser = " + JSON.stringify(data));

	  			if(data.token != undefined & data.user != undefined) {
	  				$rootScope.token = data.token;
	  				$scope.loading = true;
                    $timeout(function() {
                        $state.go("dashboard.content");
                        $scope.loading = false;
                    }, 1000);
	  			} else {
	  				$log.info("data.token not found");
	  				$scope.loading = false;
	  				$scope.incorrectAuth = true;
	  				return;
	  			}
            });
 		};
 	}]);
 });
