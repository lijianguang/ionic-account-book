angular.module('record')

.controller('stockCtrl',function($scope){
	
})

.controller('stockListCtrl',function($scope,StockService,$ionicModal,GoodsService){
	var goodsList=[];
	$scope.$on('$ionicView.afterEnter',function(){
		StockService.getList().then(function(res){
			var arr = res.rows;
			var list = [];
			for(var i=0;i<arr.length;i++){
				list.push({
					id:arr.item(i).id,
					name:arr.item(i).name,
					gunit:arr.item(i).gunit,
					PCCount:arr.item(i).PCCount || 0,
					TOCount:arr.item(i).TOCount || 0
				})
			}
			$scope.stockList=list;
		})
		GoodsService.get().then(function(res){
			goodsList = res;
		})
	})
	//$scope.goodsDetail = {};
	$scope.goDetail = function(goods){
		StockService.getGoodsDetail(goods.id).then(function(res){
			var arr = res.rows;
			var list = [];
			for(var i=0;i<arr.length;i++){
				list.push({
				id:arr.item(i).id,
				goodsId:arr.item(i).goodsId,
				PTCount:arr.item(i).PTCount,
				actualPrice:arr.item(i).actualPrice,
				actualAmount:arr.item(i).actualAmount,
				recordDate:arr.item(i).recordDate,
				lastUpdateTime:arr.item(i).lastUpdateTime,
				createTime:arr.item(i).createTime,
				remarks:arr.item(i).remarks,
				otype:arr.item(i).otype
				});
			}
			$scope.goodsDetail = {
				PCCount:goods.PCCount,
				TOCount:goods.TOCount,
				gunit:goods.gunit,
				id:goods.id,
				name:goods.name,
				recordList:list
			}
			$scope.openModal();
		})
		
	}
	$ionicModal.fromTemplateUrl('templates/stock/goods_detail.html',{
		scope:$scope,
		animation:'slide-in-up'
	}).then(function(modal){
		$scope.modal = modal;
	})
	$scope.openModal = function(){
		$scope.modal.show();
	}
	$scope.closeModal = function(){
		$scope.modal.hide();
	}
})