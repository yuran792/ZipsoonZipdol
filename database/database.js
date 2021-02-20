var mongoose=require('mongoose');

//database 에 db,schema,model 모두 추가
var database={};

//데이터베이스 연결을 위한 함수
database.init=function(app,config){
    console.log('init() 호출됨');
    
    connect(app,config);
};

//데이터베이스 연결하고 db 객체 추가
function connect(app,config){
    console.log('connect() 호출됨');
    var databaseUrl=config.db_url;
    
    console.log('데이터베이스 연결을 시도합니다');
    mongoose.Promise=global.Promise;
    mongoose.connect(databaseUrl);
    db=mongoose.connection;
    
    db.on('error',console.error.bind(console,'mongoose connection error'));
    db.on('open',function(){
        console.log('데이터베이스에 연결되었습니다 :'+databaseUrl);
        
        createSchema(app,config);
    });
    
    //연결 끊어졌을 때 5초 후 재연결
    db.on('disconnected',function(){
        console.log('연결이 끊어졌습니다. 5초 후 다시 연결합니다.');
        setInterval(connect,5000);
    });
    
    database['db']=db; //데이터베이스 모듈 안에 db 객체 속성 추가
}


//실제 schema는 userSchema 파일에서 만들고 여기서는 그 파일을 로딩하는 역할
function createSchema(app,config){
    var schemaLen=config.db_schemas.length;
    console.log('설정에 정의된 스키마의 수 : %d',schemaLen);
    
    for(var i=0;i<schemaLen;i++){
        var curItem=config.db_schemas[i];
        
        //모듈 파일에서 불러온 후 createSchema() 함수 호출하기
        var curSchema=require(curItem.file).createSchema(mongoose);
        console.log('%s 모듈을 불러들인 후 스키마 정의함.',curItem.file);
        
        //User모델 정의
        var curModel=mongoose.model(curItem.collection,curSchema);
        console.log('%s 컬렉션을 위해 모델 정의함.',curItem.collection);
        
        //database객체에 속성으로 추가
        database[curItem.schemaName]=curSchema;
        database[curItem.modelName]=curModel;
        console.log('스키마 이름[%s], 모델 이름 [%s]이 database 객체의 속성으로 추가됨',curItem.schemaName,curItem.modelName);
    }
    
    app.set('database',database); //req.app.get('database')로 데이터베이스 객체 참조 가능
    console.log('database 객체가 app 객체의 속성으로 추가됨.');
}

module.exports=database;
