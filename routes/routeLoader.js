//어떤 라우팅 모듈들이 있는지 확인한 후 해당 모듈 파일들을 읽어서 실행함

var routeLoader={};

routeLoader.init=function init(app,config,router){
    
    console.log('route init() 실행됨');
    connect(app,config,router);  
}

function connect(app,config,router){
    var routeLen=config.route_info.length;
    console.log('설정에 정의된 라우팅 수 : %d',routeLen);
    
    for(var i=0;i<routeLen;i++){
        var curItem=config.route_info[i];
        
        var curFile=require(curItem.file);
        //모듈 파일에서 불러온 후 라우팅함수 연결하기
        var curPath=curItem.path; //라우팅 루트
        var cm=curItem.method; //라우팅 함수
        
        var curMethod=curFile.connectRouterCallback(cm);
        var curType=curItem.type; //post인지 get 인지
        
        if(curType=='post'){
            router.route(curPath).post(curMethod);
        }
        else{
            router.route(curPath).get(curMethod);
        }
        
        console.log('%s 함수 불러들인 후 라우팅함.',curItem.method);
        
        //routeLoader객체에 속성으로 추가
        routeLoader[curItem.curMethod]=curMethod;
        console.log('파일 이름[%s], 함수 이름 [%s]이 routeLoader 객체의 속성으로 추가됨',curItem.file,curItem.method);
    }
    
    app.use('/',router);
}

module.exports=routeLoader;