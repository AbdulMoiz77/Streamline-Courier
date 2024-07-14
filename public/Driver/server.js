const express = require('express');
const bodyParser = require('body-parser');
const con = require('./config');

const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(__dirname));

// Connect to MySQL database
con.connect(err => {
    if (err) {
        console.error('Unable to connect to database!', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Route to get today's pickups (status: 'picked up')
app.get('/api/todays-pickups', (req, res) => {
    const query = `SELECT * FROM package WHERE status = 'picked up'`;
    con.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching pickups:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(results);
        }
    });
});

// Route to get packages ready for delivery (status: 'ready for delivery')
app.get('/api/packages-ready-for-delivery', (req, res) => {
    const query = `SELECT * FROM package WHERE status = 'ready for delivery'`;
    con.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching packages ready for delivery:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(results);
        }
    });
});

// Route to confirm pickup and update package status
app.put('/api/confirm-pickup/:packageID', (req, res) => {
    const packageID = req.params.packageID;
    const newStatus = 'ready for delivery'; // Update status to 'ready for delivery'

    const updateQuery = `
        UPDATE package
        SET status = ?
        WHERE packageID = ?
    `;
    con.query(updateQuery, [newStatus, packageID], (err, result) => {
        if (err) {
            console.error('Error updating package status:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            // Return updated package details
            const fetchQuery = `
                SELECT * FROM package WHERE packageID = ?
            `;
            con.query(fetchQuery, [packageID], (fetchErr, fetchResult) => {
                if (fetchErr) {
                    console.error('Error fetching updated package:', fetchErr);
                    res.status(500).json({ error: 'Internal Server Error' });
                } else {
                    const updatedPackage = fetchResult[0];
                    res.json(updatedPackage);
                }
            });
        }
    });
});

// Route to confirm delivery and update package status to 'delivered'
app.put('/api/confirm-delivery/:packageID', (req, res) => {
    const packageID = req.params.packageID;
    const newStatus = 'delivered'; // Update status to 'delivered'

    const updateQuery = `
        UPDATE package
        SET status = ?
        WHERE packageID = ?
    `;
    con.query(updateQuery, [newStatus, packageID], (err, result) => {
        if (err) {
            console.error('Error updating package status to delivered:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            // Return updated package details if needed
            const fetchQuery = `
                SELECT * FROM package WHERE packageID = ?
            `;
            con.query(fetchQuery, [packageID], (fetchErr, fetchResult) => {
                if (fetchErr) {
                    console.error('Error fetching updated package:', fetchErr);
                    res.status(500).json({ error: 'Internal Server Error' });
                } else {
                    const updatedPackage = fetchResult[0];
                    res.json(updatedPackage);
                }
            });
        }
    });
});

// Route to handle driver login
app.post('/api/Driverlogin', (req, res) => {
    const { name, password } = req.body;
    const query = 'SELECT driverID FROM driver WHERE driverID = ? AND pass = ?';
    con.query(query, [name, password], (err, result) => {
        if (err) {
            res.status(500).json({ success: false, error: err.message });
        } else if (result.length > 0) {
            res.json({ success: true, data: result[0].driverID });
        } else {
            res.json({ success: false });
        }
    });
});

// Route to get driver information along with feedback
app.get('/api/DriverInfo', (req, res) => {
    const driverID = req.query.driverID;
    const driverQuery = `
        SELECT d.driverID, d.DFirstName, d.DLastName, d.Phone, d.VehicleType, d.PlateNo, d.Ratings, d.Status,
               f.date_time, f.rating AS feedbackRating, f.comments
        FROM driver d
        LEFT JOIN feedback f ON d.driverID = f.driverID
        WHERE d.driverID = ?
    `;

    con.query(driverQuery, [driverID], (err, result) => {
        if (err) {
            res.status(500).json({ success: false, error: err.message });
        } else {
            res.json({ success: true, data: result });
        }
    });
});

// Serve the driver page
app.get('/driver', (req, res) => {
    res.sendFile(__dirname + '/driver.html');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
