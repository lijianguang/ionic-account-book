angular.module('record')

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  
})

.controller('LoginCtrl',function($scope,$state,AuthService,$ionicPopup){
	$scope.loginData={};

	$scope.doLogin = function(){
		AuthService.login($scope.loginData.password).then(function(success){
			$state.go('app.purchase')
		},function(err){
			$ionicPopup.alert({
				title:'登录失败',
				template:'请检查密码是否正确！'
			});
		})
	}
})
