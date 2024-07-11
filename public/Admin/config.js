// load mysql2 module
const mysql = require('mysql2');

// create mysql connection
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "panther",
    database: "courier",
    multipleStatements: true
});


// export mysql connection as module
module.exports = con;
