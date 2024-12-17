// sql.js
require('dotenv').config(); // Load environment variables from .env file
var mysql = require('mysql2');

// Create a connection using environment variables
var con = mysql.createConnection({
    host: process.env.DB_HOST,       // Access the DB_HOST from .env file
    user: process.env.DB_USER,       // Access the DB_USER from .env file
    password: process.env.DB_PASSWORD,  // Access the DB_PASSWORD from .env file
    database: process.env.DB_NAME    // Access the DB_NAME from .env file
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

module.exports = con;
