angular.module('record')

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })
    .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })
    .state('app.options',{
      url:'/options',
      views:{
        'menuContent':{
          templateUrl:'templates/options/options_list.html',
          controller:'optionsCtrl'
        }
      }
    })
    .state('app.changePassword',{
      url:'/changePassword',
      views:{
        'menuContent':{
          templateUrl:'templates/options/change_password.html',
          controller:'changePasswordCtrl'
        }
      }
    })
    .state('app.category',{
      url:'/category',
      views:{
        'menuContent':{
          templateUrl:'templates/options/category_list.html',
          controller:'categoryCtrl'
        }
      }
    })
    .state('app.goods',{
      url:'/goods',
      views:{
        'menuContent':{
          templateUrl:'templates/options/goods_list.html',
          controller:'goodsCtrl'
        }
      }
    })
    .state('app.purchase',{
      url:'/purchase',
      views:{
        'menuContent':{
          templateUrl:'templates/purchase/purchase_index.html',
          controller:'purchaseCtrl'
        }
      }
    })
    .state('app.purchaseRecord',{
      url:'/purchaseRecord',
      views:{
        'menuContent':{
          templateUrl:'templates/purchase/purchase_record.html',
          controller:'purchaseRecordCtrl'
        }
      }
    })
    .state('app.purchaseRecordList',{
      url:'/purchaseRecordList',
      views:{
        'menuContent':{
          templateUrl:'templates/purchase/record_list.html',
          controller:'purchaseRecordListCtrl'
        }
      }
    })
    .state('app.selectGoods',{
      url:'/selectGoods',
      views:{
        'menuContent':{
          templateUrl:'templates/purchase/select_goods.html',
          controller:'selectGoodsCtrl'
        }
      }
    })
    .state('app.stock',{
      url:'/stock',
      views:{
        'menuContent':{
          templateUrl:'templates/stock/stock_index.html',
          controller:'stockCtrl'
        }
      }
    })
    
    .state('app.stockList',{
      url:'/stockList',
      views:{
        'menuContent':{
          templateUrl:'templates/stock/stock_list.html',
          controller:'stockListCtrl'
        }
      }
    })
    .state('app.takeout',{
      url:'/takeout',
      views:{
        'menuContent':{
          templateUrl:'templates/takeout/takeout_index.html',
          controller:'takeoutCtrl'
        }
      }
    })
    .state('app.takeoutRecord',{
      url:'/takeoutRecord',
      views:{
        'menuContent':{
          templateUrl:'templates/takeout/takeout_record.html',
          controller:'takeoutRecordCtrl'
        }
      }
    })
    .state('app.takeoutRecordList',{
      url:'/takeoutRecordList',
      views:{
        'menuContent':{
          templateUrl:'templates/takeout/record_list.html',
          controller:'takeoutRecordListCtrl'
        }
      }
    })
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
});
