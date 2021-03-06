var crypto=require('crypto');

var Schema={};

Schema.createSchema=function(mongoose){
     //스키마 정의
     var UserSchema=mongoose.Schema({
         email:{type:String, required:true, unique:true,'default':' '}
         ,hashed_password:{type:String, required:true, 'default':' '}
         ,salt:{type:String, required:true}
         ,name:{type:String, index:'hashed','default':' '}
         ,created_at:{type:Date,index:{unique:false},'default':Date.now}
         ,userlist:[
             {type:String}
         ]  
     });
    
    //아이디를 통해 스키마 전체 정보 가져오기
     UserSchema.static('findByEmail',function(email,callback){
        return this.find({email:email},callback);
     }); //id검색 후 결과 callback함수로 전달
         
     UserSchema.static('findAll',function(calllback){
         return this.find({},callback); //모두 검색 후 callback함수로 전달
     });
    
     UserSchema.static('getUsersInfo',function(userlist,callback){
         console.log('getUsersInfo 호출됨.');
         return this.find({email:{$in:userlist}},callback);
     })
     
     UserSchema.virtual('password').set(function(password){
         this._password=password;
         this.salt=this.makeSalt();
         this.hashed_password=this.encryptPassword(password);
         console.log('virtual password 호출됨 :'+this.hashed_password);
     })
     .get(function() {return this._password});
    
     //로그인 시 확인용 메소드들
     UserSchema.method('encryptPassword',function(plainText,inSalt){
         if(inSalt){
             return crypto.createHmac('sha1',inSalt).update(plainText).digest('hex');
         }else{
             return crypto.createHmac('sha1',this.salt).update(plainText).digest('hex');
         }
     });
     
     UserSchema.method('makeSalt',function(){
         return Math.round((new Date().valueOf() *Math.random()))+'';
    });
           
    UserSchema.method('authenticate',function(plainText,inSalt,hashed_password){
        if(inSalt){
            console.log('authenticate 호출됨 : %s -> %s : %s',plainText, this.encryptPassword(plainText, inSalt),hashed_password);
            return this.encryptPassword(plainText,inSalt) ===hashed_password;
        }
        else{
            console.log('authenticate 호출됨 : %s -> %s : %s',plainText, this.encryptPassword(plainText),hashed_password);
            return this.encryptPassword(plainText) ===this.hashed_password;
        }
    });
    
        
    UserSchema.path('email').validate(function(email){
        return email.length;
    },'email 칼럼의 값이 없습니다');

    
    UserSchema.path('hashed_password').validate(function(hashed_password){
        return hashed_password.length;
    },'hashed_password 칼럼의 값이 없습니다');
    
    console.log('UserSchema 정의함');
    return UserSchema;
};

module.exports=Schema;
