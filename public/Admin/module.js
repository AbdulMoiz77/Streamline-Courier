//load the required modules
const con = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname));

con.connect((err)=>{
    if(err)
    {
        console.warn("error")
    }
    else
    {
        console.warn("connection established")
    }
});

// Endpoint to get package size based on package ID in package routing
app.get('/package-size/:packageID', (req, res) => {
    const { packageID } = req.params;
    con.query('SELECT size FROM package WHERE packageID = ?', [packageID], (err, results) => {
        if (err) {
            res.status(500).send('Error fetching package size.');
        } else {
            res.json(results[0]);
        }
    });
});

// Endpoint to get driver IDs based on vehicle type in package routing
app.get('/drivers/:VehicleType', (req, res) => {
    const { VehicleType } = req.params;
    con.query('SELECT driverID FROM driver WHERE VehicleType = ?', [VehicleType], (err, results) => {
        if (err) {
            res.status(500).send('Error fetching driver IDs.');
        } else {
            res.json(results);
        }
    });
});

// Endpoint to submit the routing form in package routing
app.post('/submit-routing', (req, res) => {
    const { packageID, pickupDate, pickupTime, driverID } = req.body;

    // Construct datetime string from pickupDate and pickupTime
    const pickupDateTime = `${pickupDate} ${pickupTime}:00`;

    // Update package table with routing information
    const sql = `UPDATE package 
                 SET pickup_time = ?, driverID = ?
                 WHERE packageID = ?`;

    con.query(sql, [pickupDateTime, driverID, packageID], (err, result) => {
        if (err) {
            console.error('Error updating package:', err);
            res.status(500).send('Error saving data to the database.');
            return;
        }

        console.log('Rows affected:', result.affectedRows);
        console.log('Package routing information saved successfully.');
        res.send('Package routing information saved successfully.');
    });
});



// Endpoint to get all package IDs which are not delivered
app.get('/packages', (req, res) => {
    const query = "SELECT packageID FROM package WHERE status != 'delivered'";
    con.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Endpoint to get the pickup address and delivery address in manage package
app.get('/package/:id', (req, res) => {
    const packageID = req.params.id;
    const query = "SELECT pickup_address, delivery_address FROM package WHERE packageID = ?";
    con.query(query, [packageID], (err, results) => {
        if (err) throw err;
        res.json(results[0]);
    });
});

// Endpoint to submit the manage package form
app.post('/submit-package', (req, res) => {
    const { packageID, deliveryDate, deliveryTime } = req.body;

    // Construct datetime string from deliveryDate and deliveryTime
    const deliveryDateTime = `${deliveryDate} ${deliveryTime}:00`;

    // Update package table with delivery information
    const sql = `UPDATE package 
                 SET delivery_time = ?
                 WHERE packageID = ?`;

    con.query(sql, [deliveryDateTime, packageID], (err, result) => {
        if (err) {
            console.error('Error updating package:', err);
            res.status(500).send('Error saving data to the database.');
            return;
        }

        console.log('Rows affected:', result.affectedRows);
        console.log('Mange package information saved successfully.');
        res.send('Manage package information saved successfully.');
    });
});



// Endpoint to fetch the payment method for a given package
app.get('/payment-method/:packageID', (req, res) => {
    const { packageID } = req.params;
    const query = 'SELECT payMethod FROM payment WHERE transactionID = (SELECT transactionID FROM package WHERE packageID = ?)';
    con.query(query, [packageID], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).send('Payment method not found.');
        }
    });
});

// Endpoint to update payment details
app.post('/update-payment', (req, res) => {
    const { packageID, paymentMethod, extraCharges } = req.body;

    //Get the transactionID from the package table
    const getTransactionIdQuery = 'SELECT transactionID FROM package WHERE packageID = ?';
    con.query(getTransactionIdQuery, [packageID], (err, results) => {
        if (err) {
            console.error('Error fetching transaction ID:', err);
            res.status(500).send('Error fetching transaction ID from the database.');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Package ID not found.');
            return;
        }

        const transactionID = results[0].transactionID;

        //Update the payment method in the payment table
        const updatePaymentQuery = 'UPDATE payment SET payMethod = ? WHERE transactionID = ?';
        con.query(updatePaymentQuery, [paymentMethod, transactionID], (err) => {
            if (err) {
                console.error('Error updating payment method:', err);
                res.status(500).send('Error updating payment method in the database.');
                return;
            }

            //Fetch the current amount from the payment table
            const getAmountQuery = 'SELECT amount FROM payment WHERE transactionID = ?';
            con.query(getAmountQuery, [transactionID], (err, results) => {
                if (err) {
                    console.error('Error fetching amount:', err);
                    res.status(500).send('Error fetching amount from the database.');
                    return;
                }

                if (results.length === 0) {
                    res.status(404).send('Transaction ID not found.');
                    return;
                }

                const currentAmount = parseFloat(results[0].amount);
                console.log('Current amount:', currentAmount);
                const updatedAmount = parseFloat(currentAmount + extraCharges);
                console.log('Updated amount:', updatedAmount);

                // Step 4: Update the amount in the payment table
                const updateAmountQuery = 'UPDATE payment SET amount = ? WHERE transactionID = ?';
                con.query(updateAmountQuery, [updatedAmount, transactionID], (err) => {
                    if (err) {
                        console.error('Error updating amount:', err);
                        res.status(500).send('Error updating amount in the database.');
                        return;
                    }

                    console.log('Payment details updated successfully.');
                    res.send({ message: 'Payment details updated successfully.' });
                });
            });

        });
    });
});


// // Start server
const port = 3000;
app.listen(port,console.log(`Server running at port:${port}`));
