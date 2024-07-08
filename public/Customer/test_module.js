// WITH NODE JS & EXPRESS

// import mysql connection file as module
var con = require('./shaz_config');

// load express and body-parser module
const express = require('express');
var bodyParser = require('body-parser');

// create express application using top level function
const app = express();

// tell express to use body-parser middleware to parse JSON data
app.use(bodyParser.json());

// tell express to use body-parser middleware to parse URL encoded data including rich objects & arrays
app.use(bodyParser.urlencoded({ extended:true }));

// set view engine for rendering dynamic html pages
app.set('view engine', 'ejs');

// serve static files from the "public/Customer" directory
app.use(express.static(__dirname));

// call the http get request method
app.get('/', function(request, response){
    response.sendFile(__dirname + '/support-section.html');     // send html file content as body
});

// call the http post request method
app.post('/', function(request, response){
    var firstName = request.body.firstName;
    var lastName = request.body.lastName;
    var email = request.body.email;
    var phone = request.body.phone;
    var message = request.body.message;

    con.connect(function(error){
        if(error){
            console.log('Unable to connect to database! ' + error);
            return response.status(500).send('Unable to connect to database!');
        }
        
        // Call the stored procedure to generate custID
        con.query("SET @cr_seq_value = 4", function(error){
            if(error) throw error;

            con.query("CALL seq_next_value('cr_sequence', @cr_seq_value);", function(error) {
                if (error) {
                    console.log('Error generating custID: ' + error);
                }
                
                // Retrieve the generated custID
                con.query("SELECT @cr_seq_value as custID", function(error, idResult) {
                    if (error) {
                        console.log('Error retrieving custID: ' + error);
                    }
                    var custID = idResult[0].custID;
                    
                    // Insert record into customer table
                    var sqlQuery = "INSERT INTO customer(custID, email) VALUES (?, ?)";
                    con.query(sqlQuery, [custID, email], function(error) {
                        if (error) {
                            console.log('Unable to insert record to database! ' + error);
                            return response.status(500).send('Unable to insert record to database!');
                        }
                        console.log('Customer record saved to database!');
                        response.send("Customer Record stored successfully! custID: " + custID);
                    });
                });
            });
        });
    });
});

// call the http get request method
app.get('/contacts', function(request, response){
    con.connect(function(error){
        if(error){
            console.log('Error connecting to database ' + error);
        }
        var sqlQuery = "select * from customer";

        con.query(sqlQuery, function(error, result){
            if(error){
                console.log('Error retriving custoemr records ' + error);
            }
            response.render(__dirname + '/getCustomers', {customers:result});
        });
    });
});

// port number where contents are displayed at browser
const port = 4000;
app.listen(port, console.log(`Server started at port: ${port}`));                       