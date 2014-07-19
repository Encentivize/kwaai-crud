var kwaaiCrud=require('./lib/crud.js');


function getOptionDefaults(options)
{
    if (typeof options.validate == "undefined" || options.validate == null){options.validate=true}
    if (typeof options.coerce == "undefined" || options.coerce == null){options.coerce=false}
}

var options={

}

getOptionDefaults(options)
console.log("here")