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


//404 오류 페이지 처리
var errorHandler=expressErrorHandler({
    static:{
        '404':'./public/404.html'
    }
});
app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

//서버 시작
http.createServer(app).listen(app.get('port'),function(){
    console.log('익스프레스 서버를 시작했습니다 : '+app.get('port'));
    
    database.init(app,config); //데이터베이스 생성
})