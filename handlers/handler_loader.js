//어떤 JSON-RPC 핸들러 함수들이 있는지 확인한 후 해당 핸들러 파일들을 읽어서 실행함

var handler_loader={};
var handler_info=require('./handler_info');
var utils=require('jayson/lib/utils');

handler_loader.init=function init(jayson,app,jsonrpc_api_path){
    
    console.log('handler_loader init() 실행됨');
    return connect(jayson,app,jsonrpc_api_path);  
}

function connect(jayson,app,jsonrpc_api_path){
    var handlers={};
    
    var handlerLen=handler_info.length;
    console.log('설정에 필요한 핸들러의 수 :%d',handlerLen);
    
    for(var i=0;i<handlerLen;i++){
        var curItem=handler_info[i];
        
        //파일에서  모듈 불러옴 
        var curHandler=require(curItem.file);
        console.log('%s 파일에서 모듈정보를 읽어옴',curItem.file);
        
        //핸들러 함수 등록
        handlers[curItem.method]=new jayson.Method({
            handler:curHandler
            ,collect:true
            ,params:Array
        });
        
        console.log('메소드 [%s]가 핸들러로 추가됨',curItem.method);
    }
        //jayson 서버 객체 생성
     var jaysonServer=jayson.server(handlers);
        
     //app의 패스로 라우팅
     console.log('패스 ['+jsonrpc_api_path+']에서 RPC호출을 라우팅하도록 설정함.');
        
     app.post(jsonrpc_api_path,function(req,res,next){
          console.log('패스 ['+jsonrpc_api_path+']에서 JSON_ROC 호출됨.');
            
          var options={};
          //Content-type 이 application/json이 아니면 415 unsupported media type error
          var contentType=req.headers['content-type']||'';
          if(!RegExp('application/json','i').test(contentType)){
               console.log('application/json 타입이 아님');
               return error(415);
          };
            
            //body 부분에 데이터가 없는 경우,500 server error
         if(!req.body||typeof(req.body)!=='object'){
              console.log('요청 body가 비정상임');
              return error(400,'Request body must be parsed');
          }
            
         //RPC 함수 호출
         console.log('RPC 함수를 호출합니다.');
         jaysonServer.call(req.body,function(error,success){
             console.log(error+success);
            var response=error||success;
               
            console.log('response'+response);
          
              //결과 데이터를 JSON으로 만들어 응답
            utils.JSON.stringify(response,options,function(err,body){
                if(err) return err;
                    
                if(body){
                    var headers={
                        'Content-Length':Buffer.byteLength(body,'utf-8'),
                        'Content-Type':'application/json'
                    };
                    console.dir('headers'+headers);
                    res.writeHead(200,headers);
                    res.write(body);
                 }else{
                    res.writeHead(204);
                 }
                 res.end();
            });   
        });
            
        //에러 응답
        function error(code,headers){
            res.writeHead(code,headers||{});
            res.end();
        }
    });
    
    return handlers;
};

module.exports=handler_loader;