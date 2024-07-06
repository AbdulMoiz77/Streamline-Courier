// WITH NODE JS & EXPRESS

// load express module
const express = require('express');

// create express application using top level function
const app = express();

// create a middleware for your application to parse JSON
app.use(express.json());

// serve static files from the "public/Customer" directory
app.use(express.static(__dirname));

// call the http get request method
app.get('/', function(request, response){
    response.sendFile(__dirname + '/support-section.html');     // send html file content as body
});

// call the http post request method
app.post('/', function(request, response){
    response.sendStatus(200);         // send successfull GET status
    console.log(request.body);        // display the output in node terminal
});

// port number where contents are displayed at browser
const port = 4000;
app.listen(port, console.log(`Server started at port: ${port}`));                       