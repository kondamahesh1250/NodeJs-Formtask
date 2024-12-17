// nodemailer.js
require('dotenv').config(); // Load environment variables from .env file

var nodemailer = require("nodemailer");
var otp = require("./otp.js");


// Create transporter using environment variables
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,  // Access the EMAIL_USER from .env
        pass: process.env.EMAIL_PASS   // Access the EMAIL_PASS from .env
    }
});

function sendotpmail(email) {
    var mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Sending Email using Node.js',
        text: `Your one time password is ${otp()}`  // Assuming otp() generates a one-time password
    }
    return mailOptions;
}

module.exports = { transporter, sendotpmail };
