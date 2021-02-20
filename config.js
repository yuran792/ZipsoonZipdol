module.exports={ //객체 할당
    server_port:3000,
    db_url:'mongodb://localhost:27017/local',
    db_schemas:[ //배열의 각 원소는 스키마 파일 정보
        {file:'./userSchema',collection:'users',schemaName:'UserSchema', modelName:'UserModel'}
    ],
    route_info:[ //배열의 각 원소는 라우팅 파일 정보
    ]
};
