angular.module('record')

.controller('purchaseCtrl',function($scope,$state){
	$scope.goRecord = function(){
		$state.go('app.purchaseRecord')
	}
	$scope.goRecordList = function(){
		$state.go('app.purchaseRecordList');
	}
})

.controller('purchaseRecordCtrl',function($scope,$state,$ionicHistory,$cordovaDatePicker,$ionicPopup,$filter,$ionicModal,PurchaseService,CategoryService,GoodsService,CalculatorService){
	
	var init = function(){
		$scope.record={
		date:$filter('date')(new Date(),'yyyy-MM-dd'),
		shouldAmount:0,
		actualAmount:0,
		}
		getCateory();
		getGoods();
		$scope.selectedGoods=[];
	}
	$scope.selectedGoods=[];
	$scope.selectGoods = function(){
		$scope.openModal();
	}
	$scope.doPurchase = function(){

		var record={record:{},items:[]};
		record.record={
			createTime:$filter('date')(new Date(),'yyyy-MM-dd HH:mm:ss'),
			recordDate:$scope.record.date,
			actualAmount:$scope.record.actualAmount,
			lastUpdateTime:$filter('date')(new Date(),'yyyy-MM-dd HH:mm:ss'),
			remarks:$scope.record.remarks||''
		}
		for(var g in $scope.selectedGoods){
			if($scope.selectedGoods[g].count>0){
				record.items.push({
					goodsId:$scope.selectedGoods[g].id,
					PTCount:$scope.selectedGoods[g].count,
					actualPrice:$scope.selectedGoods[g].price,
				});
			}
		}
		if(record.items==0){return;}
		PurchaseService.insert(record).then(function(res){
			$ionicPopup.confirm({
				title:'保存成功',
				template:'是否继续添加入库记录'
			}).then(function(res){
				if(res){
					init();
				}
				else{
					$state.go('app.purchase');
				}
			})
		})
	}
	$scope.selectDate = function(){
		var options = {
		    date: new Date(),
		    mode: 'date', // or 'time'
		    minDate: new Date() - 10000,
		    allowOldDates: true,
		    allowFutureDates: false,
		    doneButtonLabel: 'DONE',
		    doneButtonColor: '#F2F3F4',
		    cancelButtonLabel: 'CANCEL',
		    cancelButtonColor: '#000000'
		  };

		  document.addEventListener("deviceready", function () {

		    $cordovaDatePicker.show(options).then(function(date){
		        $scope.record.date=$filter('date')(date,'yyyy-MM-dd')
		    });

		  }, false);
	}
	$ionicModal.fromTemplateUrl('templates/purchase/select_goods.html', {
	    scope: $scope,
	    animation: 'slide-in-up'
	  }).then(function(modal) {
	    $scope.modal = modal;
	  });

	$scope.openModal = function(){
		$scope.modal.show();
	}
	$scope.closeModal = function(){
		$scope.modal.hide();
	}
	$scope.$on('$ionicView.afterEnter',function(){
		getCateory();
		getGoods();
		
	});
	$scope.$on('$ionicView.beforeEnter',function(){
		init();
	})
	var getCateory = function(){
		CategoryService.get().then(function(res){
			$scope.categoryList = res;
		});
	};
	var getGoods = function(){
		GoodsService.get().then(function(res){
			$scope.goodsList = res;
		});
	};
	$scope.toggleGroup = function(group) {
	    if ($scope.isGroupShown(group)) {
	      $scope.shownGroup = null;
	    } else {
	      $scope.shownGroup = group;
	    }
		  };
  $scope.isGroupShown = function(group) {
    return $scope.shownGroup === group;
  };
  
  $scope.selectDone = function(item,isChecked){
  	if(isChecked){
  		$scope.selectedGoods.push(item)
  	}
  	else{
  		$scope.selectedGoods = $scope.selectedGoods.filter(function(g){return g.id!==item.id;})
  	}
  }
  $scope.editItem = function(item){
  	item.amount = CalculatorService.mul(item.count,item.price);
  }
  $scope.done = function(){
  	for(var g in $scope.selectedGoods){
  		if($scope.selectedGoods[g].count>0){
  			$scope.record.shouldAmount= CalculatorService.add($scope.selectedGoods[g].amount,$scope.record.shouldAmount);
  		}
  	}
    $scope.record.actualAmount=$scope.record.shouldAmount;
  	$scope.closeModal();
  }
})

.controller('purchaseRecordListCtrl',function($scope,$state,$filter,$cordovaDatePicker,$ionicModal,$ionicPopup,GoodsService,PurchaseService){
	
	$scope.paging = {
		psize:10,
		pindex:1,
		keyword:'',
		doRefresh:function(){
			    this.psize=10;
			    this.pindex=1;
				PurchaseService.getRecordPaging(this.psize,this.pindex,this.keyword).then(function(res){
				$scope.recordList = res.page;
				if(res.pindex*res.psize>=res.rcount){
					$scope.paging.isMore=false;
				}
				else{
					$scope.paging.isMore=true;
				}
				$scope.paging.pindex++;
				$scope.$broadcast('scroll.refreshComplete');
			})
		},
		isMore:true,
		loadMore:function(){
			PurchaseService.getRecordPaging(this.psize,this.pindex,this.keyword).then(function(res){	
				$scope.recordList = $scope.recordList||[];
				$scope.recordList = $scope.recordList.concat(res.page);
				if(res.pindex*res.psize>=res.rcount){
					$scope.paging.isMore=false;
				}
				else{
					$scope.paging.isMore=true;
				}
				$scope.paging.pindex++;
				$scope.$broadcast('scroll.infiniteScrollComplete');
			})
		}
	}
	$scope.selectDate = function(){

		var options = {
		    date: new Date(),
		    mode: 'date', // or 'time'
		    maxDate: new Date() + 10000,
		    allowOldDates: true,
		    allowFutureDates: false,
		    doneButtonLabel: 'DONE',
		    doneButtonColor: '#F2F3F4',
		    cancelButtonLabel: 'CANCEL',
		    cancelButtonColor: '#000000'
		  };

		  document.addEventListener("deviceready", function () {

		    $cordovaDatePicker.show(options).then(function(date){
		        $scope.paging.keyword = $filter('date')(date,'yyyy-MM-dd')
		        $scope.paging.doRefresh();
		    });

		  }, false);
	}
	$scope.doClear = function(){
		$scope.paging.keyword='';
		$scope.paging.doRefresh();
	}
	$scope.$on('$ionicView.afterEnter',function(){
		GoodsService.get().then(function(res){
			$scope.goodsList=res;
		})
	});
	$scope.goDetail = function(record){
		PurchaseService.getItemByRecordId(record.id).then(function(res){
			for(var g in res){
				var item = $scope.goodsList.filter(function(goods){return goods.id===res[g].goodsId})[0];
				res[g].name=item.name;
				res[g].gunit=item.gunit;
			}
			record.items=res;
			$scope.currentRecord=record;
			$scope.openModal();
		})
	}
	$scope.del = function(record){
		
		$ionicPopup.confirm({
			title:'删除',
			template:'确认要删除该条记录吗？'
		}).then(function(res){
			if(res){
				PurchaseService.del(record.id).then(function(res){
					$scope.recordList = $scope.recordList.filter(function(c){ return c.id !== record.id;});
					},function(err){
						$ionicPopup.alert({
							title:'del-err',
							template:JSON.stringify(err)
						})
					})
			}
			
		})
	}

	$ionicModal.fromTemplateUrl('templates/purchase/record_detail.html', {
	    scope: $scope,
	    animation: 'slide-in-up'
	  }).then(function(modal) {
	    $scope.modal = modal;
	  });

	$scope.openModal = function(){
		$scope.modal.show();
	}
	$scope.closeModal = function(){
		$scope.modal.hide();
	}
})
