var getMessage=function(params,callback){
    console.log('JSON-RPC getMessage 호출됨');
    console.dir(params);
    
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
        database.UserMessageModel.findByChatid(params[0],params[1],function(err,results){
            //대화 내용이 있었다면
            if(results){
                console.log('결과물 문서 데이터의 개수 :%d',results.length);
                
                var output=[];
                for(var i=0;i<results.length;i++){
                    var cur=results[i]._doc.message;
                    for(var j=0;j<cur.length;j++){
                        output.push({sender:cur[j].sender,receiver:cur[j].receiver,date:cur[j].date,content:cur[j].content});
                    }  
                }
                console.dir(output);
                callback(null,output);
            }
            
        })
    }
};

module.exports=getMessage;