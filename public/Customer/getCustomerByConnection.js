//import mysql connection file as module
var con = require('./shaz_config');

// connect mysql with nodejs
con.connect(function(error){
    if(error) throw error;

    con.query("select * from customer", function(error, result){
        if(error) throw error;
        console.log(result);
    });
});
