var kwaaiCrud=require('./lib/crud.js');
var connectionString="mongodb://127.0.0.1:27017/testdb";


var schema={
    properties:{
        name:{type:"string"},
        description:{type:"string"}
    },
    required:["name"]
}

var validdoc={
    name:"test1",
    description:"test1"
}

var invaliddoc={
    description:"test1"
}



function operationCompleted(err,value){
    if (err){console.error(err)}
    else{console.log(value)}
}
/*

console.log("insert check arguments")
kwaaiCrud.insert({
},operationCompleted)

//invalid data
console.log("insert invalid data")
kwaaiCrud.insert({
    validate:true,
    collection:{name:"test collection",connectionString:connectionString},
    schema:schema,
    data:invaliddoc
},operationCompleted)


console.log("check schema if validate true")
kwaaiCrud.insert({
    validate:true,
    collection:{name:"test collection",connectionString:connectionString},
    data:invaliddoc
},operationCompleted)


console.log("insert data no schema")
kwaaiCrud.insert({
    validate:false,
    collection:{name:"test collection",connectionString:connectionString},
    data:validdoc
},operationCompleted)

console.log("insert data")
kwaaiCrud.insert({
    validate:true,
    collection:{name:"test collection",connectionString:connectionString},
    data:validdoc,
    schema:schema
},operationCompleted)
*/

kwaaiCrud.getByQuery({
    collection:{name:"test collection",connectionString:connectionString},
    query:{
        name:"test2"
    },
    rawQuery:{
        select:{name:1,description:1}
    }
},function(err,val){
    console.log(val)

})