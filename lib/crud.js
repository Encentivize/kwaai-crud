//todo
//add check to mquery to remove possibly dangerous query elements


var mquery=require('mquery');
var kwaaiSchema=require('kwaai-schema');
var kwaaiMongo=require('kwaai-mongo');
var mongo=require('mongodb');
var jsonpatch=require('fast-json-patch');

//*********************************************************************************************************************************************************************
//exports
//*********************************************************************************************************************************************************************

var tools=
{
    //CREATE************************************************************************************************************************************************

    /*
    inserts a record into the specified collection
    options:
    @collection(collection object or locator): mongodb native collection or locator {name:"name",connectionstring:"connectionstring"}
    @schema(object): JSON schema object to validate input against
    @validate(boolean): validate the input against a schema, if true schema is required
    @coerce(boolean):coerce the input to the specified types in the JSON schema
    @data(object): data to be inserted
     */
    insert:
        function(options,callback)
        {
            //argument checks
            if (!callback){callback=function(){}}
            getOptionDefaults(options);
            if (!options.data){return callback(new ArgumentError("data"))}
            if (!options.collection){return callback(new ArgumentError("collection"))}



            function documentInserted(err,document)
            {
                if (err){return callback(err);}
                else if (document==null){return callback(null,null);}
                else {
                    document = document[0];
                    try{
                        kwaaiSchema.mergeSchemaLinks(document,options.schema);
                    } catch(exp){
                        return callback(exp);
                    }
                    return callback(null,document);
                }
            }

            function collectionConnected(err,collection)
            {
                if (err){return callback(err)}
                if(!collection){return callback(new Error("Unable to load collection"))}

                if (options.data.dateCreated){
                    delete options.data.dateCreated;
                }
                if (options.data._id){
                    delete options.data._id;
                }
                options.data.dateCreated=new Date();
                collection.insert(options.data,{safe: true},documentInserted);
            }


            function dataPrepped(err,preppedOptions){
                if (err) { return callback(err) }
                options=preppedOptions;

                connectToCollection(options,collectionConnected);
            }

            prepDataChange(options,dataPrepped)
        }

    //READ************************************************************************************************************************************************
    /*
     gets a record by id
     options:
     @collection(collection object or locator): mongodb native collection or locator {name:"name",connectionstring:"connectionstring"}
     @id(string or monogid): the id of the object to retrive
     @query(string): query to add to the id search. Useful for multitenat or environments where you want to limit results
     @schema(object): JSON schema object to merge the schema links into on return for hyperschema
     */
    ,getById:
    function(options,callback)
    {
        if (!callback){callback=function(){}}
        if (!options.collection){return callback(new ArgumentError("collection"))}
        if (!options.id){return callback(new ArgumentError("id"))}
        getOptionDefaults(options);


        function documentFound(err,document){
            if (err){return callback(err)}
            else if (document==null){return callback(null,null)}
            else{
                try{
                    if (options.schema){
                        kwaaiSchema.mergeSchemaLinks(document,options.schema);
                    }
                }catch(exp){
                    return callback(exp);
                }
                return callback(null,document);
            }
        }

        function collectionConnected(err,collection)
        {
            if (err){return callback(err)}
            if(!collection){return callback(new Error("Unable to load collection"))}
            try {
                var query=mquery(collection).findOne(getIdQueryPart(options));
                prepQuery(query,options);
                query.exec(documentFound);
            }catch(exp){
                return callback(exp);
            }
        }

        connectToCollection(options,collectionConnected);

    }

    /*
     gets a record by query
     options:
     @collection(collection object or locator): mongodb native collection or locator {name:"name",connectionstring:"connectionstring"}
     @query(string): query to add to the id search. Useful for multitenant or environments where you want to limit results.
     @rawQuery(object): the raw mongo query to use if you don't want to parse the normal query.
     @schema(object): JSON schema object to merge the schema links into on return for hyperschema
     */
    ,getByQuery:
    function(options,callback){
        if (!callback){callback=function(){}}
        if (!options.collection){return callback(new ArgumentError("collection"))}

        function documentsFound(err,documents){
            if (err){return  callback(err)}
            if (documents==null){return callback(null,[])}
            if (documents.length==0){return callback(null,[])}

            try{
                if (options.schema){
                    for (var i=0;i<documents.length;i++){
                        kwaaiSchema.mergeSchemaLinks(documents[i],options.schema);
                    }
                }
            }catch(exp){
                return callback(exp);
            }
            return callback(null,documents);
        }

        function collectionConnected(err,collection)
        {
            if (err){return callback(err)}
            if(!collection){return callback(new Error("Unable to load collection"))}

            try{
                var query=mquery(collection).find();
                prepQuery(query,options);
                query.exec(documentsFound);
            }catch(exp){
                return callback(exp);
            }
        }
        connectToCollection(options,collectionConnected);
    }

    /*
     performs an aggregate
     options:
     @collection(collection object or locator): mongodb native collection or locator {name:"name",connectionstring:"connectionstring"}
     @pipeline(array): query to add to the id search. Useful for multitenant or environments where you want to limit results.
     @allowDiskUse: allow write to fisk for large queries
     @readPreference: allow reading from other members of the array
     */
    ,aggregate:
    function(options,callback){
        if (!callback){callback=function(){}}
        if (!options.collection){return callback(new ArgumentError("collection"))}
        if (!options.pipeline){return callback(new ArgumentError("pipeline"))}

        function aggregated(err,documents){
            if (err){return  callback(err)}
            if (documents==null){return callback(null,[])}
            if (documents.length==0){return callback(null,[])}
            return callback(null,documents);
        }

        function collectionConnected(err,collection)
        {
            if (err){return callback(err)}
            if(!collection){return callback(new Error("Unable to load collection"))}

            var aggregateOptions={};
            if (options.allowDiskUse){aggregateOptions.allowDiskUse=true;}
            if (options.readPreference){aggregateOptions.readPreference=options.readPreference;}
            try{
                collection.aggregate(options.pipeline,aggregateOptions,aggregated);
            }catch(exp){
                return callback(exp);
            }
        }

        connectToCollection(options,collectionConnected);

    }

    /*
     gets a record by query and returns the first item or null
     options:
     @collection(collection object or locator): mongodb native collection or locator {name:"name",connectionstring:"connectionstring"}
     @query(string): query to add to the id search. Useful for multitenant or environments where you want to limit results.
     @rawQuery(object): the raw mongo query to use if you don't want to parse the normal query.
     @schema(object): JSON schema object to merge the schema links into on return for hyperschema
     */
    ,getFirstOrNull : function(options, callback){
        this.getByQuery(options, getFirstDocument);

        function getFirstDocument(err, documents){
            if (err)
                return callback(err);
            if (!documents)
                return callback(null, null);
            if (documents.length ==0)
                return callback(null, null);

            return callback(null, documents[0]);

        }
    }

    /*
     returns a record count based on a queery
     options:
     @collection(collection object or locator): mongodb native collection or locator {name:"name",connectionstring:"connectionstring"}
     @query(string): query to add to the id search. Useful for multitenant or environments where you want to limit results.
     @rawQuery(object): the raw mongo query to use if you don't want to parse the normal query.
     @schema(object): JSON schema object to merge the schema links into on return for hyperschema
     */
    ,countByQuery:
        function(options,callback){
            if (!options.collection){return callback(new ArgumentError("collection"))}
            if (!callback){callback=function(){}}

            function documentsCounted(err,documentCount){
                return callback(err,documentCount);
            }

            function collectionConnected(err,collection)
            {
                if (err){return callback(err)}
                if(!collection){return callback(new Error("Unable to load collection"))}

                try{

                    var query=mquery(collection).count();
                    prepQuery(query,options);
                    query.exec(documentsCounted);

                }catch(exp){
                    return callback(exp);
                }
            }

            connectToCollection(options,collectionConnected);
        }


    //UPDATE************************************************************************************************************************************************
    /*
     replaces a record at id
     options:
     @collection(collection object or locator): mongodb native collection or locator {name:"name",connectionstring:"connectionstring"}
     @id(string or monogid): the id of the object to retrive
     @query(string): query to add to the id search. Useful for multitenat or environments where you want to limit results
     @schema(object): JSON schema object to validate input against
     @validate(boolean): validate the input against a schema, if true schema is required
     @coerce(boolean):coerce the input to the specified types in the JSON schema
     @data(object): data to be inserted
     */
    ,updateFull:
    function(options,callback)
    {
        if (!options.id){return callback(new ArgumentError("id"))}
        if (!options.collection){return callback(new ArgumentError("collection"))}
        if (!options.data){return callback(new ArgumentError("data"))}
        if (!callback){callback=function(){}}
        getOptionDefaults(options);

        function documentUpdated(err,result){
            if (err){return callback(err)}
            else if (result!=1){return callback(null,0)}
            else{return callback(null,1)}
        }

        function collectionConnected(err,collection)
        {
            if (err){return callback(err)}
            if(!collection){return callback(new Error("Unable to load collection"))}

            try{
                if(options.data._id){delete options.data._id}
                var query=mquery(collection).findOne(getIdQueryPart(options));
                prepQuery(query,options);
                query.update(options.data);
                query.setOptions({ overwrite: true });
                query.exec(documentUpdated);
            }catch(exp){
                return callback(exp);
            }
        }

        function dataPrepped(err,preppedOptions){
            if (err) { return callback(err) }
            options=preppedOptions;

            connectToCollection(options,collectionConnected);
        }

        prepDataChange(options,dataPrepped);
    }

    /*
     updates a part of the record at specified id with the specified JSON patch
     options:
     @collection(collection object or locator): mongodb native collection or locator {name:"name",connectionstring:"connectionstring"}
     @id(string or monogid): the id of the object to retrive
     @query(string): query to add to the id search. Useful for multitenat or environments where you want to limit results
     @schema(object): JSON schema object to validate input against
     @validate(boolean): validate the input against a schema, if true schema is required
     @coerce(boolean):coerce the input to the specified types in the JSON schema
     @data(object): json patch to be applied
     */
    ,updatePart:
    function(options,callback)
    {
        if (!callback){callback=function(){}}
        if (!options.id){return callback(new ArgumentError("id"))}
        if (!options.collection){return callback(new ArgumentError("collection"))}
        if (!options.data){return callback(new ArgumentError("data"))}

        getOptionDefaults(options);

        function documentUpdated(err,result){
            if (err){return callback(err)}
            else if (result!=1){return callback(null,0)}
            else{return callback(null,1)}
        }


        function documentPatched(err,patchedDoc){
            if (err) {return callback(err);}
            else if (patchedDoc==null||patchedDoc==0){return callback(null,0)}
            else {
                options.data=patchedDoc;
                tools.updateFull(options,callback);
            }
        }

        tools.generateDataPatch(options,documentPatched)

    }
    //DELETE************************************************************************************************************************************************
    /*
     deletes a record at the specified id
     options:
     @collection(collection object or locator): mongodb native collection or locator {name:"name",connectionstring:"connectionstring"}
     @id(string or monogid): the id of the object to retrive
     @query(string): query to add to the id search. Useful for multitenat or environments where you want to limit results
     */
    ,delete:
    function(options,callback)
    {
        if (!callback){callback=function(){}}
        if (!options.id){return callback(new ArgumentError("id"))}
        if (!options.collection){return callback(new ArgumentError("collection"))}

        function documentDeleted(err){
            if (err){return callback(err)}
            else{return callback()}
        }

        function collectionConnected(err,collection)
        {
            if (err){return callback(err)}
            if(!collection){return callback(new Error("Unable to load collection"))}

            try {
                var query=mquery(collection).findOne(getIdQueryPart(options));
                prepQuery(query,options);
                query.findOneAndRemove(documentDeleted);
            }catch(exp){
                return callback(exp);
            }
        }

        connectToCollection(options,collectionConnected);
    }



    /*
     validates data against teh specified JSON schema
     options:
     @collection(collection object or locator): mongodb native collection or locator {name:"name",connectionstring:"connectionstring"}
     @schema(object): JSON schema object to validate input against
     @data(object): data to validate against
     */
    ,validateData:
    function(options,callback){
        if (!options.schema){return callback(new ArgumentError("schema"))}
        if (!options.data){return callback(new ArgumentError("data"))}

        var invalid=kwaaiSchema.validateToSchema(options.data,options.schema);

        return callback(invalid);
    }

    /*
     NOT WORKING
     coerces a data object into a valid schema
     options:
     @collection(collection object or locator): mongodb native collection or locator {name:"name",connectionstring:"connectionstring"}
     @schema(object): JSON schema object to coerce input against
     @data(object): data to coerce
     */
    ,coerceData:
    function(options,callback){

        return callback(null,options.data);
    }

    /*
    generates a new given a patch and id/query and returns it.
     options:
     @collection(collection object or locator): mongodb native collection or locator {name:"name",connectionstring:"connectionstring"}
     @id(string or monogid): the id of the object to retrive
     @query(string): query to add to the id search. Useful for multitenat or environments where you want to limit results
     @data(object): json patch to be applied
     */
    ,generateDataPatch:
    function(options,callback){
        if (!options.id){return callback(new ArgumentError("id"))}
        if (!options.data){return callback(new ArgumentError("data"))}

        function documentFound(err,document)
        {
            if (err) {return callback(err);}
            else if (document==null||document==0){return callback(null,0)}
            else {
                try{
                    jsonpatch.apply(document, options.data);
                }catch(exp){
                    return callback(new Error("Error patching document:" + exp.message));
                }

                callback(null,document)
            }
        }

        function collectionConnected(err,collection)
        {
            if (err){return callback(err)}
            if(!collection){return callback(new Error("Unable to load collection"))}

            try {
                var query=mquery(collection).findOne(getIdQueryPart(options));
                prepQuery(query,options);
                query.exec(documentFound);
            }catch(exp){
                return callback(exp);
            }
        }

        connectToCollection(options,collectionConnected);
    }
}

module.exports=tools;


function prepDataChange(options,callback){
    getOptionDefaults(options);

    function coerced(err,data){
        if (err) { return callback(err) }
        options.data=data;
        return callback(null,options);
    }

    //coerce to schema
    function validated(invalid){
        if (invalid) { return callback(invalid) }
        if(options.coerce){tools.coerceData(options,coerced())}
        else{coerced(null,options.data)}
    }

    //validate to schema
    if (options.validate){
       tools.validateData(options,validated)
    }
    else{validated(null);}

}


function connectToCollection(options,callback){
    if (!options.collection){return callback(new ArgumentError("collection"))}

    if (options.collection.name&&options.collection.connectionString){
        kwaaiMongo.connectToCollection(options.collection.name,options.collection.connectionString,callback);
    }
    else{
        callback(null,options.collection)
    }
}

function getOptionDefaults(options)
{
    if (typeof options.validate == "undefined" || options.validate == null){options.validate=true}
    if (typeof options.coerce == "undefined" || options.coerce == null){options.coerce=false}
    if (typeof options.useName == "undefined" || options.useName == null){options.useName=false}
}


function getIdQueryPart(options){
    var idStr = options.id.toString();
    var ret={};
    if (idStr.length==24 && mongo.ObjectID.isValid(idStr)){
        ret={_id:new mongo.ObjectID(idStr)}
    }else if (options.useName){
        ret={name:idStr};
    }
    else{
        ret={_id:idStr}
    }

    return ret;
}


function prepQuery(query,options){
    var prohibited=["remove","update","findOneAndUpdate","findOneAndRemove"];

    if (options.rawQuery){
        for (var k in options.rawQuery ) {
            if (prohibited.indexOf(k)>-1){continue;}
            query[k](options.rawQuery[k])
        }
    }
    if(options.query){
        kwaaiMongo.buildQueryFromOptions(query,options.query)
    }
}

function ArgumentError(argument) {
    var message=("no %s specified").replace(/%s/g, argument);
    this.name = "ArgumentError";
    this.message = (message || "");
    this.argument=argument;
}
ArgumentError.prototype = new Error();



