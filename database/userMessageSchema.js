var messageSchema={};

messageSchema.createSchema=function(mongoose){
    //스키마 정의
    var date=new Date();
    var UserMessageSchema=mongoose.Schema({
        chatId:{type:String,required:true,'default':''}
        ,message:[
            {sender:{type:String,required:true}
            ,receiver:{type:String,required:true}
            ,date:{type:String,'default':date.getFullYear()+'년 '+date.getMonth()+'월 '+date.getDate()+'일 '+date.getHours()+'시 '+date.getMinutes()+'분'}
            ,content:{type:String,'default':' '}}
        ]
    });
    
    UserMessageSchema.static('findByChatid',function(user1,user2,callback){
        var str1=user1+user2;
        var str2=user2+user1;
        return this.find({},callback);
        //return this.find({$or:[{chatId:str1},{chatId:str2}]}).sort({date:1});
    });
    UserMessageSchema.method('addMessage',function(message,callback){
        this.message.push(message);
        return this.save(callback);
    });

    
    UserMessageSchema.path('chatId').required(true,'채팅방 아이디가 필요합니다');
    
    return UserMessageSchema;
};

module.exports=messageSchema;