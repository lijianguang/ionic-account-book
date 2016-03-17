angular.module('record')

.controller('optionsCtrl',function($scope){

})

.controller('changePasswordCtrl',function($scope,$state,AuthService,$ionicPopup){
	$scope.data={};

	$scope.doChange = function(){
		AuthService.changePassword($scope.data.oldPassword,$scope.data.newPassword).then(function(success){
			$ionicPopup.alert({
				title:'修改成功',
				template:'将跳转至登录页面重新登录！',
			}).then(function(res){
				$state.go('login');
			})
			
		},function(err){
			$ionicPopup.alert({
				title:'修改失败',
				template:'请确认旧密码是否正确！'
			});
		})
	}
})

.controller('categoryCtrl',function($scope,CategoryService,$ionicPopup){

	$scope.$on('$ionicView.afterEnter',function(){
		$scope.get();
	})

	$scope.get = function(){
		CategoryService.get().then(function(res){
			$scope.categoryList=res;
		},function(err){
			$ionicPopup.alert({
				title:'get-err',
				template:JSON.stringify(err)
			})
		})
	}
	$scope.insert = function(){
		$ionicPopup.prompt({
			title:'添加分类',
			template:'输入分类名',
			inputType:'text',
			inputPlaceholder:'分类名'
		}).then(function(res){
			if(res){
				CategoryService.insert(res).then(function(res){
			        $scope.get();
				},function(err){
					$ionicPopup.alert({
						title:'insert-err',
						template:JSON.stringify(err)
					})
				})
			}
		});
		
	}
	$scope.edit = function(item){
		$ionicPopup.prompt({
			title: '修改分类',
   			template: '输入新分类名',
   			inputType: 'text',
   			defaultText: item.name
		}).then(function(res){
			if(res){
				CategoryService.update(item.id,res).then(function(res){
					$scope.get();
				},function(err){
					$ionicPopup.alert({
						title:'update-err',
						template:JSON.stringify(err)
					})
				})
			}
		});
		
	}
	$scope.del = function(item){
		$ionicPopup.confirm({
			title:'删除',
			template:'确认要删除\"'+item.name+'\"分类吗？'
		}).then(function(res){
			if(res){
				CategoryService.del(item.id).then(function(res){
					$scope.categoryList = $scope.categoryList.filter(function(c){ return c.id !== item.id;});
					},function(err){
						$ionicPopup.alert({
							title:'del-err',
							template:JSON.stringify(err)
						})
					})
			}
			
		})
		
	}
})

.controller('goodsCtrl',function($scope,GoodsService,$ionicModal,CategoryService,$ionicPopup,$ionicLoading){
	$scope.data={};
	$scope.goods={};
	var addOrEdit = '';
	$scope.$on('$ionicView.afterEnter',function(){
		get();
		getCategory();
	})
	var getCategory = function(){
		CategoryService.get().then(function(res){
			$scope.categoryList=res;
		},function(err){
			$scope.categoryList=[];
		})
	}
	var get = function(){
		GoodsService.get().then(function(res){
			$scope.goodsList=res;
		},function(err){
			$ionicPopup.alert({
				title:'get-err',
				template:JSON.stringify(err)
			})
		})
	}

	var insert = function(goods){

		GoodsService.insert(goods).then(function(res){
			closeModal();
		},function(err){
			$ionicPopup.alert({
				title:'错误',
				template:err
			})
		})
	}
	var update = function(id,goods){
		GoodsService.update(id,goods).then(function(res){
			closeModal();
		},function(err){
			$ionicPopup.alert({
				title:'错误',
				template:err
			})
		})
	}
	$scope.willAdd = function(){
		addOrEdit='add';
		$scope.goods={};
		openModal();
	}
	$scope.willEdit = function(goods){
		addOrEdit='edit';

		$scope.goods={
			id:goods.id,
			name:goods.name,
			category:{id:goods.categoryId},
			format:goods.format||'',
			unit:goods.gunit||'',
			price:goods.price
		}
		console.log($scope.goods)
		openModal();
	}
	$scope.doSomeThing = function(){
		console.log(addOrEdit)
		if(addOrEdit==='add'){
			doAdd()
		}
		else if(addOrEdit==='edit'){
			doEdit()
		}
		else{

		}
	}
	var doEdit = function(){
		var id=$scope.goods.id;
		var ugoods = {
			name:$scope.goods.name,
			categoryId:parseInt($scope.goods.category.id),
			format:$scope.goods.format||'',
			gunit:$scope.goods.unit||'',
			price:$scope.goods.price
		}
		console.log($scope.goods.category)
		update(id,ugoods);
	}
	var doAdd = function(){
		//name:'TEXT',categoryId:'INTEGER',format:'TEXT',unit:'TEXT',price:'DECIMAL'
		var igoods = {
			name:$scope.goods.name,
			categoryId:parseInt($scope.goods.category.id),
			format:$scope.goods.format||'',
			gunit:$scope.goods.unit,
			price:$scope.goods.price
		}
		insert(igoods);
	}
	
	
	$scope.del = function(item){
		$ionicPopup.confirm({
			title:'删除',
			template:'确认要删除\"'+item.name+'\"商品吗？'
		}).then(function(res){
			if(res){
				GoodsService.del(item.id).then(function(res){
					$scope.goodsList = $scope.goodsList.filter(function(c){ return c.id !== item.id;});
					},function(err){
						$ionicPopup.alert({
							title:'del-err',
							template:JSON.stringify(err)
						})
					})
			}
			
		})
		
	}

	$ionicModal.fromTemplateUrl('templates/options/add_goods.html', {
	    scope: $scope,
	    animation: 'slide-in-up'
	  }).then(function(modal) {
	  	console.log('modal')
	    $scope.modal = modal;
	  });

	var openModal = function(){
		$scope.modal.show();
	}
	var closeModal = function(){
		$scope.modal.hide();
		get();
	}
	$scope.closeModal=function(){
		closeModal();
	}
	  //Cleanup the modal when we're done with it!
	  $scope.$on('$destroy', function() {
	    $scope.modal.remove();
	    console.log('$destroy')
	  });
	  // Execute action on hide modal
	  $scope.$on('modal.hidden', function() {
	    // Execute action
	    console.log('modal.hidden')
	  });
	  // Execute action on remove modal
	  $scope.$on('modal.removed', function() {
	    // Execute action
	    console.log('modal.removed')
	  });
})