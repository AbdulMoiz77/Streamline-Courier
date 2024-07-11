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

// serve static files from the "public/Customer" directory
app.use(express.static(__dirname));

// call the http get request method
app.get('/customer', function(request, response){
    response.sendFile(__dirname + '/cust.html');     // send html file content as body
});


app.post('/api/getCustomerName', (req, resp) =>{
    const receivedData = req.body;
    con.query('SELECT userType FROM customer WHERE custID = ?', [receivedData.custID], (error, result)=>{
        if(error){
            console.log(error);
        }
        else{
            const userType = result[0].userType;
            if(userType == 'individual'){
                con.query('SELECT FirstName FROM indi_customer WHERE custID = ?', [receivedData.custID], (error, result)=>{
                    if(error){
                        console.log(error);
                    }else{
                        resp.send({userType:userType, data: result[0].FirstName });
                    }
                });
            }
        }
    });
});

app.post('/api/totalPackages', (req, res) => {
    const receivedData = req.body;

    const query = `
        SELECT COUNT(*) AS totalPackages
        FROM package
        WHERE custID = ?;
    `;

    con.query(query, [receivedData.custID], (error, results) => {
        if (error) {
            console.error('Error counting total packages:', error);
            res.status(500).json({ success: false, message: 'Error counting total packages' });
            return;
        }

        const totalPackages = results[0].totalPackages;
        res.json({ success: true, totalPackages });
    });
});

app.post('/api/completedPackages', (req, res) => {
    const receivedData = req.body;

    const query = `
        SELECT COUNT(*) AS completedPackages
        FROM package
        WHERE custID = ? AND status = 'delivered';
    `;

    con.query(query, [receivedData.custID], (error, results) => {
        if (error) {
            console.error('Error counting completed packages:', error);
            res.status(500).json({ success: false, message: 'Error counting completed packages' });
            return;
        }

        const completedPackages = results[0].completedPackages;
        res.json({ success: true, completedPackages });
    });
});

app.post('/track', (request, response) => {
    const { trackingNumber } = request.body;
    
    // Query to fetch package details including driver information
    const query = `
        SELECT p.packageID, p.status, d.DFirstName, d.DLastName, d.Phone, d.PlateNo
        FROM package p
        LEFT JOIN driver d ON p.driverID = d.driverID
        WHERE p.packageID = ?;
    `;
    
    con.query(query, [trackingNumber], (error, results) => {
        if (error) {
            console.error('Error tracking package:', error);
            response.status(500).json({ success: false, message: 'Error tracking package' });
            return;
        }
        
        if (results.length > 0) {
            const packageData = results[0];
            response.json({ 
                success: true, 
                data: {
                    packageID: packageData.packageID,
                    driverName: `${packageData.DFirstName} ${packageData.DLastName}`,
                    driverPhone: packageData.Phone,
                    plateNo: packageData.PlateNo,
                    status: packageData.status,
                }
            });
        } else {
            response.json({ success: false, message: 'Package not found' });
        }
    });
});

app.post('/api/getSenderNamePhone', (req, resp) => {
    const receivedData = req.body;

    con.query('SELECT userType FROM customer WHERE custID = ?', [receivedData.custID], (error, result) => {
        if (error) {
            console.log(error);
            resp.status(500).send('Error fetching user type');
            return;
        }

        if (result.length === 0) {
            resp.status(404).send('Customer not found');
            return;
        }

        const userType = result[0].userType;

        if (userType === 'individual') {
            con.query('SELECT FirstName, LastName FROM indi_customer WHERE custID = ?', [receivedData.custID], (error, nameResult) => {
                if (error) {
                    console.log(error);
                    resp.status(500).send('Error fetching individual customer data');
                    return;
                }

                else if (nameResult.length === 0) {
                    resp.status(404).send('Individual customer not found');
                    return;
                }

                con.query('SELECT PhoneNo FROM phoneno_customer WHERE custID = ?', [receivedData.custID], (error, phoneResult) => {
                    if (error) {
                        console.log(error);
                        resp.status(500).send('Error fetching phone number');
                        return;
                    }

                    else if (phoneResult.length === 0) {
                        resp.status(404).send('Phone number not found');
                        return;
                    }

                    resp.send({
                        success: true,
                        userType: userType,
                        data: {
                            firstName: nameResult[0].FirstName,
                            lastName: nameResult[0].LastName,
                            phone: phoneResult[0].PhoneNo
                        }
                    });
                });
            });
        }
    });
});

app.post('/generatePackageID', (req, resp) => {
    const query = `
        SET @pk_seq_value = null;
        CALL seq_next_value('pk_sequence', @pk_seq_value);
        SELECT @pk_seq_value;
    `;

    con.query(query, (error, results) => {
        if (error) {
            console.error('Error generating package ID:', error);
            resp.status(500).send({ message: 'Error generating package ID' });
            return;
        }

        const pack_id = results[2][0]['@pk_seq_value'];
        console.log('Generated package ID:', pack_id);
        resp.send({ packageID: pack_id });
    });
});

app.post('/placeOrder', (req, resp) => {
    const receivedData = req.body;
    console.log('Received order details:', receivedData);

    const insertQuery = `
        INSERT INTO package(packageID, pickup_address, delivery_address, size, fragile, status, custID)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    con.query(insertQuery, [
        receivedData.packageID,
        receivedData.pickupAddress,
        receivedData.deliveryAddress,
        receivedData.size,
        receivedData.fragile,
        receivedData.status,
        receivedData.custID
    ], (insertError, insertResult) => {
        if (insertError) {
            console.error('Error inserting order data:', insertError);
            resp.status(500).send({ message: 'Error inserting order data' });
            return;
        }

        console.log('Order inserted successfully:', insertResult);
        resp.send({ message: 'Success', data: receivedData });
    });
});

    app.post('/api/getPastOrders', (req, resp) => {
        const query = `
            SELECT p.packageID, p.status, p.delivery_address, p.delivery_time, p.size, 
                d.driverID, d.DFirstName, d.DLastName, d.Phone, d.PlateNo,
                IFNULL(f.rating, 'N/A') AS rating, IFNULL(f.comments, 'N/A') AS comments
            FROM package p
            LEFT JOIN driver d ON p.driverID = d.driverID
            LEFT JOIN feedback f ON p.packageID = f.packageID AND p.driverID = f.driverID
            WHERE p.status IN ('cancelled', 'delivered')
            ORDER BY p.delivery_time DESC
            LIMIT 5;
        `;

        con.query(query, (error, results) => {
            if (error) {
                console.error('Error fetching past orders:', error);
                resp.status(500).send({ success: false, message: 'Error fetching past orders' });
                return;
            }

            resp.send({ success: true, data: results });
        });
    });

    app.post('/api/submitRating', (req, resp) => {
        const { packageID, driverID, rating, comments } = req.body;
        const dateTime = new Date(); // Get the current timestamp

        const query = `
            INSERT INTO feedback (packageID, driverID, date_time, rating, comments)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE rating = VALUES(rating), comments = VALUES(comments);
        `;

        con.query(query, [packageID, driverID, dateTime, rating, comments], (error, results) => {
            if (error) {
                console.error('Error submitting rating:', error);
                resp.status(500).send({ success: false, message: 'Error submitting rating' });
                return;
            }

            resp.send({ success: true, message: 'Rating submitted successfully' });
        });
    });

// // call the http post request method
// app.post('/contactUs', function(request, response){
//     var firstName = request.body.firstName;
//     var lastName = request.body.lastName;
//     var email = request.body.email;
//     var phone = request.body.phone;
//     var message = request.body.message;

//     con.connect(function(error){
//         if(error){
//             console.log('Unable to connect to database! ' + error);
//         }
        
//         // Call the stored procedure to generate custID
//         con.query("CALL seq_next_value('cr_sequence', @cr_seq_value);", function(error) {
//             if (error) {
//                 console.log('Error generating custID: ' + error);
//             }
            
//             // Retrieve the generated custID
//             con.query("SELECT @cr_seq_value as custID", function(error, idResult) {
//                 if (error) {
//                     console.log('Error retrieving custID: ' + error);
//                 }
//                 var custID = idResult[0].custID;
                
//                 // Insert record into customer table
//                 var sqlQuery = "INSERT INTO customer(custID, email) VALUES (?, ?)";
//                 con.query(sqlQuery, [custID, email], function(error) {
//                     if (error) {
//                         console.log('Unable to insert record to database! ' + error);
//                     }
//                     console.log('Customer record saved to database successfully!');
//                     response.send("Customer Record stored successfully! custID: " + custID);
//                 });
//             });
//         });
//     });
// });

// port number where contents are displayed at browser
const port = 4000;
app.listen(port, console.log(`Server started at port: ${port}`)); 