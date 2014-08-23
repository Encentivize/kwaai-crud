#kwaai-crud

CRUD helpers for mongoDB

##Description
A set of helper tools to assist in working with CRUD operations with Node.

Why not use Mongoose?
Mongoose is a great ORM tool for Mongo. BUT it's an ORM tool in an environment where we're meant to be getting away from the friction of ORM. 

The kwaai bits and pieces allow for a more modular approach to working with NodeJS and Mongo and are much less prescriptive and more flexible. 

##API

###insert(options,callback)
inserts a record into the specified collection
options:
@collection(collection object or locator): mongodb native collection or locator {name:"name",connectionstring:"connectionstring"}
@schema(object): JSON schema object to validate input against
@validate(boolean): validate the input against a schema, if true schema is required
@coerce(boolean):coerce the input to the specified types in the JSON schema
@data(object): data to be inserted
    
###getById(options,callback)
gets a record by id
options:
@collection(collection object or locator): mongodb native collection or locator {name:"name",connectionstring:"connectionstring"}
@id(string or monogid): the id of the object to retrive
@query(string): query to add to the id search. Useful for multitenat or environments where you want to limit results
@schema(object): JSON schema object to merge the schema links into on return for hyperschema

###getByQuery(options,callback)
gets a record by query
options:
@collection(collection object or locator): mongodb native collection or locator {name:"name",connectionstring:"connectionstring"}
@query(string): query to add to the id search. Useful for multitenant or environments where you want to limit results. 
@rawQuery(object): the raw mongo query to use if you don't want to parse the normal query.
@schema(object): JSON schema object to merge the schema links into on return for hyperschema
     
###countByQuery(options,callback)
returns a record count based on a query
options:
@collection(collection object or locator): mongodb native collection or locator {name:"name",connectionstring:"connectionstring"}
@query(string): query to add to the id search. Useful for multitenant or environments where you want to limit results.
@rawQuery(object): the raw mongo query to use if you don't want to parse the normal query.
@schema(object): JSON schema object to merge the schema links into on return for hyperschema

###getFirstOrNull(options,callback)
 gets a record by query and returns the first item or null
 options:
 @collection(collection object or locator): mongodb native collection or locator {name:"name",connectionstring:"connectionstring"}
 @query(string): query to add to the id search. Useful for multitenant or environments where you want to limit results.
 @rawQuery(object): the raw mongo query to use if you don't want to parse the normal query.
 @schema(object): JSON schema object to merge the schema links into on return for hyperschema

###updateFull(options,callback)
replaces a record at id
 options:
 @collection(collection object or locator): mongodb native collection or locator {name:"name",connectionstring:"connectionstring"}
 @id(string or monogid): the id of the object to retrive
 @query(string): query to add to the id search. Useful for multitenat or environments where you want to limit results
 @schema(object): JSON schema object to validate input against
 @validate(boolean): validate the input against a schema, if true schema is required
 @coerce(boolean):coerce the input to the specified types in the JSON schema
 @data(object): data to be replaced
     
###updatePart(options,callback)
updates a part of the record at specified id with the specified JSON patch
 options:
 @collection(collection object or locator): mongodb native collection or locator {name:"name",connectionstring:"connectionstring"}
 @id(string or monogid): the id of the object to retrive
 @query(string): query to add to the id search. Useful for multitenat or environments where you want to limit results
 @schema(object): JSON schema object to validate input against
 @validate(boolean): validate the input against a schema, if true schema is required
 @coerce(boolean):coerce the input to the specified types in the JSON schema
 @data(object): json patch to be applied

###delete(options,callback)
 deletes a record at the specified id
 options:
 @collection(collection object or locator): mongodb native collection or locator {name:"name",connectionstring:"connectionstring"}
 @id(string or monogid): the id of the object to retrive
 @query(string): query to add to the id search. Useful for multitenat or environments where you want to limit results
     
###validateData(options,callback)
validates data against teh specified JSON schema
 options:
 @collection(collection object or locator): mongodb native collection or locator {name:"name",connectionstring:"connectionstring"}
 @schema(object): JSON schema object to validate input against
 @data(object): data to validate against
 
###coerceData(options,callback)
NOT WORKING
 coerces a data object into a valid schema
 options:
 @collection(collection object or locator): mongodb native collection or locator {name:"name",connectionstring:"connectionstring"}
 @schema(object): JSON schema object to coerce input against
 @data(object): data to coerce
 
###generateDataPatch(options,callback)
generates a new given a patch and id/query and returns it.
 options:
 @collection(collection object or locator): mongodb native collection or locator {name:"name",connectionstring:"connectionstring"}
 @id(string or monogid): the id of the object to retrive
 @query(string): query to add to the id search. Useful for multitenat or environments where you want to limit results
 @data(object): json patch to be applied