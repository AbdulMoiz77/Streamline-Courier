// load mysql2 module
const mysql = require('mysql2');

// load secured password file
const pass = require('./password');

// create mysql connection
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: pass,
    database: "courier",
    multipleStatements: true
});

// export mysql connection as module
module.exports = con;

