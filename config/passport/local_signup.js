var LocalStrategy=require('passport-local').Strategy;

//패스포트 회원가입 설정
module.exports= new LocalStrategy({
    usernameField:'email',
    passwordField:'password',
    passReqToCallback:true
},function(req,email,password,done){
    var paramName=req.body.name||req.query.name;
    console.log('passport와 local-singup 호출됨 :'+email+', '+password+', '+paramName);
    
    //findByEmail이 blocking 되므로 async로 변경
    process.nextTick(function(){
        var database=req.app.get('database');
        database.UserModel.findByEmail(email,function(err,user){
            if(err){
                return done(err); //done 함수는 인증결과를 알려줌
            }
            if(user.length!=0){
                console.log('기존에 계정이 있음');
                return done(null,false,req.flash('signupMessage','계정이 이미 있습니다'));
            }
            else{
                var user=new database.UserModel({email:email,password:password,name:paramName});
                
                user.save(function(err){
                    if(err){throw err;}
                    console.log('사용자 데이터 추가함');
                    setTimeout(function(){return done(null,user);},5000);
                });
            }
        });
    });
});
