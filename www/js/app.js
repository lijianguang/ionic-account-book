// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('record', ['ionic', 'ngCordova','ionic-sidetabs'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    //$cordovaSplashscreen.hide();
  });
})

.run(function ($rootScope, $state, AuthService) {
  $rootScope.$on('$stateChangeStart', function (event,next, nextParams, fromState) {
    // console.log('$stateChangeStart')
    // if ('data' in next && 'authorizedRoles' in next.data) {
    //   var authorizedRoles = next.data.authorizedRoles;
    //   if (!AuthService.isAuthorized(authorizedRoles)) {
    //     event.preventDefault();
    //     $state.go($state.current, {}, {reload: true});
    //     $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
    //   }
    // }

    if (!AuthService.isAuthenticated()) {
      if (next.name !== 'login') {
        event.preventDefault();
        $state.go('login');
      }
    }
  });
})

.run(function(DBService){
    DBService.create('CATEGORY',{name:'TEXT'},function(res){console.log(res)});
    DBService.create('GOODS',{name:'TEXT',categoryId:'INTEGER',format:'TEXT',gunit:'TEXT',price:'DECIMAL'},function(res){console.log(res)});
    //DBService.create('STORE',{goodsId:'INTEGER',systemCount:'INTEGER',checkCount:'INTEGER'},function(res){console.log(res)});
    //TYPE 1:PURCHASE  0:TAKEOUT
    
    // DBService.drop('PURCHASE_RECORD')
    // DBService.drop('PURCHASE_ITEM_RECORD')
    // DBService.drop('TAKEOUT_RECORD')
    // DBService.drop('TAKEOUT_ITEM_RECORD')

    DBService.create('PURCHASE_RECORD',{createTime:'DATETIME',recordDate:'DATE',actualAmount:'DECIMAL',lastUpdateTime:'DATETIME',remarks:'TEXT'},function(res){console.log(res)});
    DBService.create('PURCHASE_ITEM_RECORD',{recordId:'INTEGER',goodsId:'INTEGER',PTCount:'INTEGER',actualPrice:'DECIMAL'},function(res){console.log(res)});
    
    DBService.create('TAKEOUT_RECORD',{createTime:'DATETIME',recordDate:'DATE',lastUpdateTime:'DATETIME',remarks:'TEXT'},function(res){console.log(res)});
    DBService.create('TAKEOUT_ITEM_RECORD',{recordId:'INTEGER',goodsId:'INTEGER',PTCount:'INTEGER'},function(res){console.log(res)});


})

