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
app.get('/customer', function(request, response){
    response.sendFile(__dirname + '/cust.html');     // send html file content as body
});

// Call the HTTP GET request method to render the page with package data
// app.get('/track', function(request, response){
//     con.connect(function(error){
//         if(error){
//             console.log('Unable to connect to database! ' + error);
//         }
        
//         con.query("SELECT * FROM package", function(error, results) {
//             if (error) {
//                 console.log('Error retrieving package data: ' + error);
//             }
//             response.render(__dirname + '/tracking', { packages: results });
//         });
//     });
// });

app.post('/track', (request, response) => {
    const { trackingNumber } = request.body;
    const query = `SELECT * FROM package WHERE packageID = ?`;
    
    con.query(query, [trackingNumber], (error, result) => {
        if (error) throw error;
        if (result.length > 0) {
            const packageData = result[0];
            response.json({ 
                success: true, 
                package: {
                    packageID: packageData.packageID,
                    recipientName: packageData.recipient_name,
                    driverId: packageData.driver_id,
                    driverName: packageData.driver_name,
                    status: packageData.status,
                    pickupTime: packageData.pickup_time,
                    pickupAddress: packageData.pickup_address,
                    deliveryAddress: packageData.delivery_address,
                    size: packageData.size,
                    vehicleType: packageData.vehicle_type
                }
            });
        } else {
            response.json({ success: false });
        }
    });
});

// call the http post request method
app.post('/placeOrder', function(request, response){
    // var senderName = request.body.senderName;
    // var recipientName = request.body.recipientName;
    // var senderPhone = request.body.senderPhone;
    // var recipientPhone = request.body.recipientPhone;
    // var senderEmail = request.body.senderEmail;
    const { pickupAddress, deliveryAddress, size, fragile } = request.body;

    con.connect(function(error){
        if(error){
            console.log('Unable to connect to database! ' + error);
        }
        
        // Call the stored procedure to generate packageID
        con.query("CALL seq_next_value('pk_sequence', @pk_seq_value);", function(error) {
            if (error) {
                console.log('Error generating packageID: ' + error);
            }
            
            // Retrieve the generated packageID
            con.query("SELECT @pk_seq_value as packageID", function(error, idResult) {
                if (error) {
                    console.log('Error retrieving packageID: ' + error);
                }
                var packageID = idResult[0].packageID;
                
                // Insert record into package table
                var sqlQuery = "INSERT INTO package(packageID, pickup_address, delivery_address, size, fragile) VALUES (?, ?, ?, ?, ?)";
                con.query(sqlQuery, [packageID, pickupAddress, deliveryAddress, size, fragile], function(error) {
                    if (error) {
                        console.log('Unable to insert record to database! ' + error);
                    }
                    console.log('Package record saved to database successfully!');
                    response.send("Package record stored successfully! packageID: " + packageID);
                    response.redirect('/track');
                });
            });
        });
    });
});

// call the http post request method
app.post('/contactUs', function(request, response){
    // var firstName = request.body.firstName;
    // var lastName = request.body.lastName;
    var email = request.body.email;
    // var phone = request.body.phone;
    // var message = request.body.message;

    con.connect(function(error){
        if(error){
            console.log('Unable to connect to database! ' + error);
        }
        
        // Call the stored procedure to generate custID
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
                    }
                    console.log('Customer record saved to database successfully!');
                    response.send("Customer Record stored successfully! custID: " + custID);
                });
            });
        });
    });
});

// port number where contents are displayed at browser
const port = 4000;
app.listen(port, console.log(`Server started at port: ${port}`)); 