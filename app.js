//express 기본 모듈 불러오기
var express=require('express')
    ,http=require('http')
    ,path=require('path');

//epxress 미들웨어 불러오기
var bodyParser=require('body-parser')
    ,static=require('serve-static');
var cookieParser=require('cookie-parser');
//오류 핸들러 미들웨어
var expressErrorHandler=require('express-error-handler');

//세선 미들웨어
var expressSession=require('express-session');

//파일 업로드용 미들웨어
var multer=require('multer');
var fs=require('fs');

var socketio=require('socket.io')(); //객체가 아니고 클래스임
//클라이언트에서 ajax 요청했을 때 cors(다중 서버 접속)지원
var cors=require('cors');

var config=require('./config'); //설정파일
var database=require('./database/database'); //데이터베이스 파일
var route_loader=require('./routes/routeLoader'); //라우팅 파일

var ejs=require('ejs');

//passport 사용
var passport=require('passport');
var flash=require('connect-flash');

//express 객체 생성
var app=express();


console.log('config.server_port : %d',config.server_port);
//기본 속성 설정
app.set('port',process.env.PORT||config.server_port);
//뷰 엔진 설정
app.set('views',__dirname+'/views');
app.set('view engine','ejs');
console.log('뷰 엔진이 ejs로 설정되었습니다.');

//미들웨어 사용 body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({extended:false}));
//body-parser를 이용해 application/json 파싱
app.use(bodyParser.json());

//html폴더에 있는 파일들 클라이언트가 접근 가능
app.use('/public',static(path.join(__dirname,'public')));

app.use(cookieParser());
app.use(expressSession({
    secret:'my key',
    resave:true,
    saveUninitialized:true
}));

//클라이언트에서 ajax 요청했을 때 cors(다중 서버 접속)지원
app.use(cors());

var storage=multer.diskStorage({
    destination: function(req,file,callback){
        callback(null,'uploads')
    },
    filename: function(req,file,callback){
        callback(null,file.originalname+Date.now())
    }
});

var upload=multer({
    storage:storage,
    limits:{
        files:10,
        fileSize:1024*1024*1024
    }
});

//passport 사용 설정
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//passport 설정
var configPassport=require('./config/passport');
configPassport(app,passport);

var userPassport=require('./routes/user_passport'); //라우팅
userPassport(app,passport);

var handler_loader=require('./handlers/handler_loader');

//JSON-RPC 사용
var jayson=require('jayson');

//JSON-RPC 핸들러 정보를 읽어 들여 핸들러 경로 설정
var jsonrpc_api_path=config.jsonrpc_api_path||'/api';
handler_loader.init(jayson,app,jsonrpc_api_path);

console.log('JSON_RPC를 ['+jsonrpc_api_path+'] 패스에서 사용하도록 설정함');

//404 오류 페이지 처리
var errorHandler=expressErrorHandler({
    static:{
        '404':'./public/404.html'
    }
});
app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

//서버 시작
var server=http.createServer(app).listen(app.get('port'),function(){
    console.log('익스프레스 서버를 시작했습니다 : '+app.get('port'));
    
    database.init(app,config); //데이터베이스 생성
})


//socket.io 서버를 시작합니다
var io= socketio.listen(server); //io 객체 안에 socket 객체가 포함됨
console.log('socket.io 요청을 받아들일 준비가 되엇습니다.');

//클라이언트가 연결했을 때의 이벤트 처리
io.sockets.on('connection',function(socket){    
    console.log('connection info : ',socket.request.connection._peername);
    
    //소켓 객체에 클라이언트 host, port 정보 속성으로 추가
    socket.remoteAddress=socket.request.connection._peername.address;
    socket.remotePort=socket.request.connection._peername.port;
    
    
    //로그인 아이디 매핑 --> 쪽지함에 들어와있는 사람들
    var login_ids={};
    
    socket.on('login',function(login){ //쪽지함 접속 시
        console.log('쪽지함 로그인 이벤트를 받았습니다');
        console.log(login);
        console.log('접속한 소켓의 id :'+socket.id);
        login_ids[login.id]=socket.id;
        socket.login_id=login.id;
        console.log('접속한 클라이언트 ID의 개수 : %d',Object.keys(login_ids).length); //배열로 바꾼 후 개수 출력
        console.dir(login_ids);
        //데이터베이스 불러오기
        
        //var userlist=getUserlistFromDB(db,login.id);
        //socket.emit('userlist',userlist);
    });

    
    //message 이벤트를 받았을 때의 처리
    socket.on('message',function(message){
        console.log('message 이벤트를 받았습니다.');
        console.dir(login_ids);
        
        //일대일 채팅 대상에게 메시지 전달
        if(login_ids[message.receiver]){
            if(io.sockets.connected[login_ids[message.receiver]]){ //접속 리스트에도 있고 연결되어있다면
                io.sockets.connected[login_ids[message.receiver]].emit('message',message);
            }
            else{ //쪽지함을 떠난 것으로
                 login_ids.delete(message.receiver); //리스트에서 삭제
                //데이터베이스에 저장
            }
            
            
        }else{//현재 접속중이지 않음
            console.log('상대방이 실시간에 있지 않습니다.');
            var database=global.database;
            if(database.db){
                var chatid= database.UserMessageModel.findByChatid(message.sender,message.receiver,function(err,result){
                    if(err) throw err;
                    
                    var newmessage={sender:message.sender,receiver:message.receiver,date:message.date,content:message.content};
                    if(result.length!=0){ //대화내역이 있다면    
                        result[0].addMessage(newmessage,function(err){
                            if(err) throw err;
                            console.log('메시지를 저장했습니다.');
                        });
                        
                    }
                    else{
                        var chat=new database.UserMessageModel({
                            chatId:message.sender+message.receiver,message:[newmessage]
                        });
                        chat.save(function(err){
                            if(err) throw err;
                            console.log('채팅방을 생성합니다.')
                        })
                        
                    }
                    
                });
            }
        }
    });
    
});