//대화를 나눈 상대 리스트 출력
var usermessageList=function(params,callback){
    console.log('JSON-RPC usermessageList 호출됨');
    console.dir(params);
    
    //데이터베이스 객체 참조
    var database=global.database;
    if(database){
        console.log('database 객체 참조됨');
    }
    else{
        console.log('database 객체 불가함');
        callback({
            code:410,
            message:'database 불가함'
            
        },null);
        return;
    }
    
    if(database.db){
        database.UserModel.findByEmail(params[0].id,function(err,results){
            //대화 상대가 있었다면
            if(results){
                console.log('결과물 문서 데이터의 개수 :%d',results.length);
                var output=[];
                for(var i=0;i<results.length;i++){
                    var userlistlen=results[i]._doc.userlist.length;
                    var userlist=results[i]._doc.userlist;
                    database.UserModel.getUsersInfo(userlist,function(err,user){
                        if(err) {throw err};
                            
                        for(var j=0;j<user.length;j++){
                            output.push({email:user[j]._doc.email,name:user[j]._doc.name});
                        }
                        callback(null,output);
                    });
                } 
            }
            
        })
        
    }
}

module.exports=usermessageList;
