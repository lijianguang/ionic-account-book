angular.module('record')

.service('DBService',function($q){
    
    var _db = window.openDatabase('my.db','1.0.0','record database',1024*1024*40)
	//var db = $cordovaSQLite.openDB({ name: "my.db" });

	var execute = function(sql,param,callback) {  
             //参数处理  
            if( !param ){  
                param = [];  
            }else if(typeof param == 'function' ){  
                callback = param;  
                param = [];  
            }  

             query(sql, param, function(result){  
                 if( typeof callback == 'function' ){
                         
                     callback(result.rowsAffected);  
                 }  
             });  
         };
    var query =function(sql, param, callback){  
            //参数处理  
            if( !param ){  
                param = [];  
            }else if(typeof param == 'function' ){  
                callback = param;  
                param = [];  
            }  
               
            //只有一个参数  
            _db.transaction(function (tx) {  
                //4个参数：sql，替换sql中问号的数组，成功回调，出错回调  
                tx.executeSql(sql,param,function(tx,result){  
                    if (typeof callback == 'function' ){  
                        callback(result);  
                    }  
                },onfail) ;  
            })  
        };
    var select = function(table,where,callback){
        var sql = 'SELECT * FROM '+table+' '+(where||'');
        query(sql, [], function(result){  
                 if( typeof callback == 'function' ){  
                    var res=[];
                    for(var i=0;i<result.rows.length;i++){
                        res.push(result.rows.item(i))
                    }
                    callback(res);  
                 }  
             }); 
    }
    var insert = function(table, data, callback){  
            if( typeof data != 'object' && typeof callback == 'function' ){  
                callback(0);  
            }  
              
            var k=[];  
            var v=[];  
            var param=[];  
            for(var i in data ){  
                k.push('['+i+']');  
                v.push('?');  
                param.push('\''+data[i]+'\''||'');  
            }  
            var sql="INSERT INTO "+table+"("+k.join(',')+") VALUES("+param.join(',')+")";  
            //alert(sql)
            // alert(JSON.stringify(param))
            query(sql, [], function(result){  
                if ( typeof callback == 'function'){  
                    callback(result.insertId);  
                }  
            });  
        };
    var update = function(table, data, where, param, callback ){  
            //参数处理  
            if( !param ){  
                param = [];  
            }else if(typeof param == 'function' ){  
                callback = param;  
                param = [];  
            }  
              
            var set_info = mkWhere(data);  
            for(var i=set_info.param.length-1;i>=0; i--){  
                param.unshift(set_info.param[i]);  
            }  
            var sql = "UPDATE "+table+" SET "+set_info.sql;  
            if( where ){  
                sql += " WHERE "+where;  
            }  

            query(sql, param, function(result){  
                if( typeof callback == 'function' ){  
                    callback(result.rowsAffected);  
                }  
            });  
        };
    var del = function(table, where, param, callback ){  
            //参数处理  
            if( !param ){  
                param = [];  
            }else if(typeof param == 'function' ){  
                callback = param;  
                param = [];  
            }  
              
            var sql = "DELETE FROM "+table+" WHERE "+where;  
            query(sql, param, function(result){  
                if( typeof callback == 'function' ){  
                    callback(result.rowsAffected);  
                }  
            });  
        };
    var mkWhere = function(data){  
            var arr=[];  
            var param=[];  
            if( typeof data === 'object' ){  
                for (var i in data){  
                    arr.push('['+i+']'+"=?");  
                    param.push(data[i]||'');   
                }  
            }  
            return {sql:arr.join(' , '),param:param};  
        };
    var onfail = function(tx,e){  
            alert('error'+JSON.stringify(e.message))
            console.log('sql error: '+e.message);  
        };
    var createTable = function(name,fields,callback){
        var sql = 'CREATE TABLE IF NOT EXISTS ' + name;
        sql += '(id INTEGER PRIMARY KEY AUTOINCREMENT,';
        var field = [];
        for(var f in fields){
            field.push(f+' '+fields[f]);
        }
        sql += field.join(',');
        sql += ')';

        execute(sql,[],callback);
        //CREATE TABLE IF NOT EXISTS Messages (id INTEGER PRIMARY KEY AUTOINCREMENT, message TEXT)
    }
    var dropTable = function(name,callback){
        execute('DROP TABLE ' + name,[],callback);
    }
    var delById = function(table,id,callback){
        del(table,' id = '+id,[],callback)
    }

    return {
        execute:execute,
        insert:insert,
        update:update,
        del:del,
        create:createTable,
        drop:dropTable,
        query:query,
        select:select,
        delById:delById
    }
})

// .service('CordovaDBService',function($q,$ionicPlatform,$cordovaSQLite){

// })

// .service('PouchdbService',function($q){
//     var _db;
//     var init = function(){
//         _db = new PouchDB('mydb',{adapter:'websql'});
//     }
// })

.service('AuthService',function($q){
	var LOCAL_PASSWORD_KEY = 'pw';
	var isAuthenticated = false;

	function destroyUserCredentials(){
		window.localStorage.removeItem(LOCAL_PASSWORD_KEY);
        isAuthenticated = false;
	}
	function getPassword(){
		return window.localStorage.getItem(LOCAL_PASSWORD_KEY);
	}
	function setPassword(pw){
		window.localStorage.setItem(LOCAL_PASSWORD_KEY,pw);
	}

	var login = function(pw){
		return $q(function(resolve,reject){
			if(!getPassword()){setPassword(pw);}
			if(pw&&getPassword()==pw){
                isAuthenticated = true;
				resolve('Login success.');
			}
			else{
				reject('Login Failed.');
			}
		});
	};

	var logout = function(){
		destroyUserCredentials();
	};
	var changePassword = function(oldpw,newpw){
		return $q(function(resolve,reject){
			if(oldpw&&oldpw==getPassword()&&newpw){
				setPassword(newpw);
				resolve('Change success.');
			}
			else{
				reject('Change failed.');
			}
		});
	};

	var isAuthorized = function(authorizedRoles){
		return getPassword()?true:false;
	};

	return {
		login:login,
		//logout:logout,
		isAuthorized:isAuthorized,
		isAuthenticated:function(){return isAuthenticated;},
		changePassword:changePassword
	}
})

.service('CategoryService',function($q,DBService){
    var table = 'CATEGORY';
    var get = function(id){
        var deferred = $q.defer();
        var where;
        if(id){
            where += 'WHERE id = '+id;
        }
        try{
            DBService.select(table,where,deferred.resolve);
        }
        catch(e){
            deferred.reject(e.message);
        }
        return deferred.promise;
    }
    var insert = function(name){
        
        var deferred = $q.defer();
        
        try{
            DBService.insert(table,{name:name},deferred.resolve);
        }
        catch(e){
            deferred.reject(e.message);
        }
        return deferred.promise;
    }
    var update = function(id,name){
        var deferred = $q.defer();
        try{
            DBService.update(table,{name:name},' id = ' + id,deferred.resolve);
        }
        catch(e){
            deferred.reject(e.message);
        }
        return deferred.promise;
    }
    var del = function(id){
        
        var deferred = $q.defer();
        try{
            DBService.del(table,'id = '+id,deferred.resolve);
        }
        catch(e){
            deferred.reject(e.message);
        }
        return deferred.promise;
    }

    return {
        get:get,
        insert:insert,
        update:update,
        del:del
    }
})

.service('GoodsService',function($q,DBService){
    var table = 'GOODS';
    var get = function(name){
        var deferred = $q.defer();
        var where='';
        if(name){
            where += 'WHERE name like \''+name+'\'';
        }
        try{
            DBService.select(table,where,deferred.resolve);
        }
        catch(e){
            deferred.reject(e.message);
        }
        return deferred.promise;
    }
    var getById = function(id){
        var deferred = $q.defer();
        var where='';
        if(id){
            where += 'WHERE id = '+id;
        }
        try{
            DBService.select(table,where,deferred.resolve);
        }
        catch(e){
            deferred.reject(e.message);
        }
        return deferred.promise;
    }
    var insert = function(goods){
        var deferred = $q.defer();
        
        try{
            DBService.insert(table,goods,deferred.resolve);
        }
        catch(e){
            deferred.reject(e.message);
        }
        return deferred.promise;
    }
    var del = function(id){
        var deferred = $q.defer();
        try{
            DBService.delById(table,id,deferred.resolve);
        }
        catch(e){
            deferred.reject(e.message);
        }
        return deferred.promise;
    }
    var update = function(id,goods){
        var deferred = $q.defer();
        try{
            DBService.update(table,goods,' id = ' + id,deferred.resolve);
        }
        catch(e){
            deferred.reject(e.message);
        }
        return deferred.promise;
    }

    return {
        get:get,
        getById:getById,
        insert:insert,
        del:del,
        update:update
    }
})

.service('PurchaseService',function($q,DBService){
    var self = this;
    var tableRecord = 'PURCHASE_RECORD';
    var tableItemRecord = 'PURCHASE_ITEM_RECORD';
    this.insert = function(record){
        return $q(function(resolve,reject){
            DBService.insert(tableRecord,record.record,function(rid){
                for(var i in record.items){
                    record.items[i].recordId=rid;
                    DBService.insert(tableItemRecord,record.items[i],function(riid){
                    })
                }
                resolve();
            })
        })
    }

    this.del = function(id){
        return $q(function(resolve,reject){
            DBService.delById(tableRecord,id,function(){
                DBService.del(tableItemRecord,'recordId = '+id,[],resolve);
            });
        })
    }
    this.delItem = function(id){
        return $q(function(){
            DBService.delById(tableItemRecord,id,resolve);
        });
    }
    this.update = function(id,record){
        return $q(function(resolve,reject){
            DBService.update(tableRecord,record,' id = '+id,resolve);
        });
    }
    this.updateItem = function(id,item){
        return $q(function(resolve,reject){
            DBService.update(tableItemRecord,item,' id = '+id,resolve);
        })
    }
    this.get = function(id){
        return $q(function(resolve,reject){
            var where=id?' WHERE id = '+id:'';
            DBService.select(tableRecord,where,resolve);
        });
    }
    this.getItemByRecordId = function(id){
        return $q(function(resolve,reject){
            var where = ' WHERE goodsId in (SELECT id FROM GOODS) '
            where += id?(' AND recordId = '+id):'';
            DBService.select(tableItemRecord,where,resolve);
        });
    }
    this.getRecordPaging = function(psize,pindex,keyword){
        return $q(function(resolve,reject){
            var sql = 'SELECT * FROM '+tableRecord;
            sql += keyword?' WHERE recordDate like \'%'+keyword+'%\'':'';
            sql += ' ORDER BY recordDate desc,createTime desc '
            sql += ' LIMIT '+(pindex-1)*psize+','+psize;
            DBService.query(sql,[],function(res){
                var arr = res.rows;
                var list = [];
                for(var i=0;i<arr.length;i++){
                    list.push(arr.item(i));
                }
                var csql='SELECT COUNT(*) RowNumber FROM '+tableRecord;
                DBService.query(csql,[],function(count){
                    
                    resolve({rcount:count.rows.item(0).RowNumber,pindex:pindex,psize:psize,page:list});
                })
                
            })
        })
    }
    this.getItem = function(id){
        return $q(function(resolve,reject){
            var where=id?(' WHERE id = '+id):'';
            DBService.select(tableItemRecord,where,resolve);
        });
    }
})

.service('TakeoutService',function($q,DBService){
    var self = this;
    var tableRecord = 'TAKEOUT_RECORD';
    var tableItemRecord = 'TAKEOUT_ITEM_RECORD';
    this.insert = function(record){
        return $q(function(resolve,reject){
            DBService.insert(tableRecord,record.record,function(rid){
                for(var i in record.items){
                    record.items[i].recordId=rid;
                    DBService.insert(tableItemRecord,record.items[i],function(riid){
                    })
                }
                resolve();
            })
        })
    }
    this.del = function(id){
        return $q(function(resolve,reject){
            DBService.delById(tableRecord,id,function(){
                DBService.del(tableItemRecord,'recordId = '+id,[],resolve);
            });
        })
    }
    this.delItem = function(id){
        return $q(function(){
            DBService.delById(tableItemRecord,id,resolve);
        });
    }
    this.update = function(id,record){
        return $q(function(resolve,reject){
            DBService.update(tableRecord,record,' id = '+id,resolve);
        });
    }
    this.updateItem = function(id,item){
        return $q(function(resolve,reject){
            DBService.update(tableItemRecord,item,' id = '+id,resolve);
        })
    }
    this.get = function(id){
        return $q(function(resolve,reject){
            var where=id?' WHERE id = '+id:'';
            DBService.select(tableRecord,where,resolve);
        });
    }
    this.getRecordPaging = function(psize,pindex,keyword){
        return $q(function(resolve,reject){
            var sql = 'SELECT * FROM '+tableRecord;
            sql += keyword?' WHERE recordDate like \'%'+keyword+'%\'':'';
            sql += ' ORDER BY recordDate desc,createTime desc '
            sql += ' LIMIT '+(pindex-1)*psize+','+psize;
            DBService.query(sql,[],function(res){
                var arr = res.rows;
                var list = [];
                for(var i=0;i<arr.length;i++){
                    list.push(arr.item(i));
                }
                var csql='SELECT COUNT(*) RowNumber FROM '+tableRecord;
                DBService.query(csql,[],function(count){
                   
                    resolve({rcount:count.rows.item(0).RowNumber,pindex:pindex,psize:psize,page:list});
                })
                
            })
        })
    }
    this.getItemByRecordId = function(id){
        return $q(function(resolve,reject){
            var where=id?(' WHERE recordId = '+id):'';
            DBService.select(tableItemRecord,where,resolve);
        });
    }
    this.getItem = function(id){
        return $q(function(resolve,reject){
            var where=id?(' WHERE id = '+id):'';
            DBService.select(tableItemRecord,where,resolve);
        });
    }
})

.service('StockService',function($q,DBService){
    var self = this;
    var purchaseRecord = 'PURCHASE_RECORD';
    var purchaseItemRecord = 'PURCHASE_ITEM_RECORD';
    var takeoutRecord = 'TAKEOUT_RECORD';
    var takeoutItemRecord = 'TAKEOUT_ITEM_RECORD';
    var goods='GOODS';
    this.getList = function(){
        return $q(function(resolve,reject){
            var sql='SELECT G.Id,G.name,G.gunit,PC.PCCount,TT.TOCount FROM '+goods+' G '
            sql+=' LEFT JOIN (SELECT PIR.goodsId,SUM(PIR.PTCount) PCCount FROM '+purchaseItemRecord+' PIR INNER JOIN '+purchaseRecord+' PR ON PIR.recordId=PR.id GROUP BY PIR.goodsId) PC ON G.Id=PC.goodsId ';
            sql+=' LEFT JOIN (SELECT TIR.goodsId,SUM(TIR.PTCount) TOCount FROM '+takeoutItemRecord+' TIR INNER JOIN '+takeoutRecord+' TR ON TIR.recordId=TR.id GROUP BY TIR.goodsId) TT ON G.Id=TT.goodsId ';
            DBService.query(sql,[],resolve);
        })
    }
    this.getGoodsDetail = function(id){
        return $q(function(resolve,reject){
            var sql='SELECT * FROM ('
            sql += ' SELECT TR.id,TR.recordDate,TR.remarks,TR.createTime,TR.lastUpdateTime,TIR.goodsId,TIR.PTCount,0 actualAmount,0 actualPrice,0 otype FROM '+takeoutRecord+' TR INNER JOIN '+takeoutItemRecord+' TIR ON TR.id=TIR.recordId ';
            sql += id?' WHERE TIR.goodsId = '+id:'';
            sql += ' UNION ALL ';
            sql += ' SELECT PR.id,PR.recordDate,PR.remarks,PR.createTime,PR.lastUpdateTime,PIR.goodsId,PIR.PTCount,PR.actualAmount,PIR.actualPrice,1 otype FROM '+purchaseRecord+' PR INNER JOIN '+purchaseItemRecord+' PIR ON PR.id=PIR.recordId ';
            sql += id?' WHERE PIR.goodsId = '+id:'';
            sql += ' )';
            sql += ' ORDER BY recordDate desc,createTime desc'
            DBService.query(sql,[],resolve);
        });
    }
})

.service('CalculatorService',function(){
    var self = this;
    this.add = function(v1, v2)
    {
    ///<summary>精确计算加法。语法：Math.add(v1, v2)</summary>
    ///<param name="v1" type="number">操作数。</param>
    ///<param name="v2" type="number">操作数。</param>
    ///<returns type="number">计算结果。</returns>
      var r1, r2, m;
      try
      { 
        r1 = v1.toString().split(".")[1].length;
      }
      catch (e)
      {
        r1 = 0;
      }
      try
      {
        r2 = v2.toString().split(".")[1].length;
      }
      catch (e)
      {
        r2 = 0;
      }
      m = window.Math.pow(10, window.Math.max(r1, r2));
      
      return (v1 * m + v2 * m) / m;
    }



    this.sub = function(v1, v2)
    {
    ///<summary>精确计算减法。语法：window.Math.sub(v1, v2)</summary>
    ///<param name="v1" type="number">操作数。</param>
    ///<param name="v2" type="number">操作数。</param>
    ///<returns type="number">计算结果。</returns>
      return window.Math.add(v1, -v2);
    }

    this.mul = function(v1, v2)
    {
    ///<summary>精确计算乘法。语法：window.Math.mul(v1, v2)</summary>
    ///<param name="v1" type="number">操作数。</param>
    ///<param name="v2" type="number">操作数。</param>
    ///<returns type="number">计算结果。</returns>
      var m = 0;
      var s1 = v1.toString();
      var s2 = v2.toString();
      try
      {
        m += s1.split(".")[1].length;
      }
      catch (e)
      {
      }
      try
      {
        m += s2.split(".")[1].length;
      }
      catch (e)
      {
      }
      
      return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / window.Math.pow(10, m);
    }

    this.div = function(v1, v2)
    {
    ///<summary>精确计算除法。语法：window.Math.div(v1, v2)</summary>
    ///<param name="v1" type="number">操作数。</param>
    ///<param name="v2" type="number">操作数。</param>
    ///<returns type="number">计算结果。</returns>
      var t1 = 0;
      var t2 = 0;
      var r1, r2;
      try
      {
        t1 = v1.toString().split(".")[1].length;
      }
      catch (e)
      {
      }
      try
      {
        t2 = v2.toString().split(".")[1].length;
      }
      catch (e)
      {
      }

      with (window.Math)
      {
        r1 = Number(v1.toString().replace(".", ""));
        r2 = Number(v2.toString().replace(".", ""));
        return (r1 / r2) * pow(10, t2 - t1);
      }
    }
})