module.exports={ //객체 할당
    server_port:3000,
    db_url:'mongodb://localhost:27017/local',
    db_schemas:[ //배열의 각 원소는 스키마 파일 정보
        {file:'./userSchema',collection:'user',schemaName:'UserSchema', modelName:'UserModel'}
        ,{file:'./userMessageSchema',collection:'message',schemaName:'UserMessageSchema',modelName:'UserMessageModel'}
        ,{file:'./post_schema',collection:'post',schemaName:'PostSchema',modelName:'PostModel'}
    ],
    route_info:[ //배열의 각 원소는 라우팅 파일 정보
    ],
    jsonrpc_api_path: '/api'
};
