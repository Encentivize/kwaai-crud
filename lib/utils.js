
var kwaaiSchema=require('kwaai-schema');


var utils={
    /*
     validates data against the specified JSON schema
     options:
     @collection(collection object or locator): mongodb native collection or locator {name:"name",connectionstring:"connectionstring"}
     @schema(object): JSON schema object to validate input against
     @data(object): data to validate against
     */
    validateData:
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
            if (!options.schema){return callback(new ArgumentError("schema"))}
            if (!options.data){return callback(new ArgumentError("data"))}

            return callback(null,options.data);
        }

    ,buildQueryFromOptions:
        function(query,options){
            var queryOptions = getQueryOptions(options);

            var arr, i, re;
            for (var key in options) {
                if(queryOptions.protected.indexOf(key)>-1)
                {
                    continue;
                }
                query.where(key);
                var value = options[key];

                if ('~' === value[0]) {
                    re = new RegExp(value.substring(1), 'i');
                    query.where(key).regex(re);
                } else if ('>' === value[0]) {
                    if ('=' === value[1]) {
                        query.gte(value.substr(2));
                    } else {
                        query.gt(value.substr(1));
                    }
                } else if ('<' === value[0]) {
                    if ('=' === value[1]) {
                        query.lte(value.substr(2));
                    } else {
                        query.lt(value.substr(1));
                    }
                } else if ('!' === value[0] && '=' === value[1]) { //H+ for !=
                    query.ne(value.substr(2));
                } else if ('[' === value[0] && ']' === value[value.length - 1]) {
                    query.in(value.substr(1, value.length - 2).split(','));
                } else {
                    query.equals(value);
                }
            }

            //H+ exposes Query AND, OR and WHERE methods
            if (queryOptions.current.query) {
                query.where(JSON.parse(queryOptions.current.query,
                    jsonQueryParser));
            }
            //TODO - as introduction of QUERY param obsoletes need of $and, $or
            if (queryOptions.current.$and) {
                query.and(JSON.parse(queryOptions.current.$and, jsonQueryParser));
            }
            if (queryOptions.current.$or) {
                query.or(JSON.parse(queryOptions.current.$or, jsonQueryParser));
            }
            //H+ exposes Query AND, OR methods

            if (queryOptions.current.skip) {
                query.skip(queryOptions.current.skip);
            }
            if (queryOptions.current.limit) {
                query.limit(queryOptions.current.limit);
            }
            if (queryOptions.current.sort) {
                query.sort(queryOptions.current.sort);
            }
            var selectObj = {root: {}};
            if (queryOptions.current.select) {

                if (queryOptions.current.select) {
                    arr = queryOptions.current.select.split(',');
                    for (i = 0; i < arr.length; ++i) {
                        if (arr[i].match(/\./)) {
                            var subSelect = arr[i].split('.');
                            if (!selectObj[subSelect[0]]) {
                                selectObj[subSelect[0]] = {};
                                //selectObj.root[subSelect[0]] = 1;
                            }
                            selectObj[subSelect[0]][subSelect[1]] = 1;
                        } else {
                            selectObj.root[arr[i]] = 1;
                        }
                    }
                }
                query.select(selectObj.root);
            }

            //doesnt currently work
            //if (queryOptions.current.populate) {
            //    arr = queryOptions.current.populate.split(',');
            //    for (i = 0; i < arr.length; ++i) {
            //        if (!_.isUndefined(selectObj[arr[i]]) &&
            //            !_.isEmpty(selectObj.root)) {
            //            selectObj.root[arr[i]] = 1;
            //        }
            //        query = query.populate(arr[i], selectObj[arr[i]]);
            //    }
            //    query.select(selectObj.root);
            //}

            //return query;

        }


    ,JSONPatchToMongo:function(jsonPatch){
        if (!Array.isArray(jsonPatch)){throw new Error("JSON patch is not array");}
        var retPatch={};
        for (var i=0;i<jsonPatch.length;i++){
            var patchItem=jsonPatch[i];
            var pathArr=patchItem.path.split("/");
            //remove trailing /
            pathArr.shift();
            var from = null;
            if (patchItem.from){
                from=patchItem.from.substring(1).replace("/",".");
            }
            var mongoPath=pathArr.join(".");
            if (patchItem.op=="add"){
                if (pathArr[pathArr.length-1]=="-"){
                    if (!retPatch.$push){retPatch.$push={}}
                    retPatch.$push[mongoPath.replace(".-","")]=patchItem.value;
                }
                else{
                    if (!retPatch.$set){retPatch.$set={}}
                    retPatch.$set[mongoPath]=patchItem.value;
                }
            }else if (patchItem.op=="replace"){
                if (!retPatch.$set){retPatch.$set={}}
                retPatch.$set[mongoPath]=patchItem.value;
            }
            else if (patchItem.op=="move"){
                throw Error("Not supported by mongo");
            }
            else if (patchItem.op=="copy"){
                throw Error("Not supported by mongo");
            }
            else if (patchItem.op=="delete"){
                if (!retPatch.$unset){retPatch.$unset={}}
                retPatch.$unset[mongoPath]="";
            }
            else if (patchItem.op=="test"){
                throw Error("Not supported by mongo");
                //TODO add exists
            }
        }


        return retPatch;
    }
}

module.exports=utils;




//*********************************************************************************************************************************************************************
//private functions
//*********************************************************************************************************************************************************************
function jsonQueryParser(key, value) {
    if (_.isString(value)) {
        if ('~' === value[0]) { //parse RegExp
            return new RegExp(value.substring(1), 'i');
        } else if ('>' === value[0]) {
            if ('=' === value[1]) {
                return {$gte: value.substr(2)};
            } else {
                return {$gt: value.substr(1)};
            }
        } else if ('<' === value[0]) {
            if ('=' === value[1]) {
                return {$lte: value.substr(2)};
            } else {
                return {$lt: value.substr(1)};
            }
        } else if ('!' === value[0] && '=' === value[1]) {
            return {$ne: value.substr(2)};
        }
    } else if (_.isArray(value)) {
        if (model.schema.paths.hasOwnProperty(key)) {
            return {$in: value};
        }
    }
    return value;
}

function getQueryOptions(options)
{
    newQueryOptions = {
        protected: ['skip', 'limit', 'sort', 'populate', 'select', 'lean',
            '$and', '$or', 'query'],//H+ exposes OR, AND and WHERE methods
        current: {}
    };

    for (var key in options) {
        if (newQueryOptions.protected.indexOf(key) !== -1) {
            newQueryOptions.current[key] = options[key];
        }
    }
    return newQueryOptions;
}

function ArgumentError(argument) {
    var message=("no %s specified").replace(/%s/g, argument);
    this.name = "ArgumentError";
    this.message = (message || "");
    this.argument=argument;
}
ArgumentError.prototype = new Error();

