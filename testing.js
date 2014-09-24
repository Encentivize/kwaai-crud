var kwaaiCrud=require('./lib/crud.js');
var connectionString="mongodb://127.0.0.1:27017/testdb";
var mongo=require("mongodb");

var schema={
    properties:{
        name:{type:"string"},
        description:{type:"string"}
    },
    required:["name"]
}

var validdoc={
    name:"testDistinct",
    description:"testDistinct",
    addVal:"val2"
}

var invaliddoc={
    description:"test1"
}



function operationCompleted(err,value){
    if (err){console.error(err)}
    else{console.log(value)}

    process.exit(1)
}

kwaaiCrud.generateDataPatch({
    collection:{name:"test collection",connectionString:connectionString},
    id:"540af26377e3ed1c0568e4c4",
    data:[
        {op:"add","path":"/anotherThing","value":"a value xxx"}

    ]
},operationCompleted)



/*

 kwaaiCrud.delete({
 collection:{name:"test collection",connectionString:connectionString},
 id:"5400a4160b56b58c1a0e1979",
 useName:true
 },operationCompleted)


 kwaaiCrud.updateFull({
 validate:true,
 collection:{name:"test collection",connectionString:connectionString},
 data:validdoc,
 schema:schema,
 id:"testDistinct",
 useName:true
 },operationCompleted)

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


 kwaaiCrud.aggregate({
 collection:{name:"test collection",connectionString:connectionString},
 pipeline:[
 {
 $group : {
 _id : "Count",

 count: { $sum: 1 }
 }
 }
 ]

 },function(err,val){
 console.log(val)

 })


kwaaiCrud.getByQuery({
    collection:{name:"test collection",connectionString:connectionString},
    query:{
        select:"name"
    },
    rawQuery:{
        select:{name:1,description:1}
    }
},function(err,val){
    console.log(val)

})

 kwaaiCrud.countByQuery({
 collection:{name:"test collection",connectionString:connectionString},
 rawQuery:{
 where:{name:"test2"}
 }

 },function(err,val){
 console.log(val)

 })
*/


