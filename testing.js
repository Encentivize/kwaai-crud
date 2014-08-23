var kwaaiCrud=require('./lib/crud.js');
var kwaaiMongo=require("kwaai-mongo");

var connectionString="mongodb://127.0.0.1:27017/testdb";


function itemInserted(err,item){
    if (err){console.error(err)}

    else{console.log("item inserted:" + item.count)}
}

kwaaiMongo.connectToCollection("testcrud",connectionString,function(err){

for (var i=0;i<10;i++){
    kwaaiCrud.insert({
        schema:{
            properties:{
                name:{type:"string"},
                count:{type:"integer"},
                value:{type:"string"}
            }
        },
        collection:{name:"testcrud",connectionString:connectionString},
        validate:true,
        data:{
            name:"test",
            count:i,
            value:"some value"
        }
    },itemInserted)
}})