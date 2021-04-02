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
        var database=global.database;
        database.UserModel.findByEmail(email,function(err,user){
            if(err){
                return done(err); //done 함수는 인증결과를 알려줌
            }
            if(user.length!=0){
                console.log('기존에 계정이 있음');
                return done(null,false,req.flash('signupMessage','이메일이 이미 등록되어 있습니다'));
            }
            else{
                var user=new database.UserModel({email:email,password:password,name:paramName,userlist:['hyur0920@gmail.com']});
                
                user.save(function(err){
                    if(err){throw err;}
                    console.log('사용자 데이터 추가함');
                    setTimeout(function(){return done(null,user);},6000);
                });
                
                /*
                var chat=new database.UserMessageModel({chatId:'hyur0920@gmail.comkim@naver.com',message:[{sender:'hyur0920@gmail.com',receiver:'kim@naver.com',date:Date.now(),content:'님 어디?'}]});
                
                chat.save(function(err){
                    if(err) {throw err;}
                    console.log('채팅방 만듦');
                    done(null,null);
                });*/
                /*
                var chat=database.UserMessageModel.findByChatid('kim@naver.com','hyur0920@gmail.com',function(err,results){
                    results[0].addMessage({sender:'kim@naver.com',receiver:'hyur0920@gmail.com',date:Date.now(),content:'지금 가는중~'},function(err){
                        if(err) throw err;
                        console.log('메세지 데이터 추가함');
                        return done(null,user);
                    })

                }); */
            }
        });
    });
});
