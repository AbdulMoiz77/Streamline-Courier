const mysql = require('mysql2');
const pass = require('./password'); // Ensure this is the correct path

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: pass,
    database: "courier",
    multipleStatements: true
});

module.exports = con;
