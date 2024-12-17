require('dotenv').config();
var express = require("express");
var app = express();
var cors = require("cors");
var conn = require("./sql.js");
var bcrypt = require("bcrypt");
var { transporter, sendotpmail } = require("./nodemailer.js");
var upload = require("./multer.js");
var multer = require("multer");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/register", upload.single("file"), async (req, res) => {

    let { fullname, email, password } = req.body;
    var salt = 10;

    var passwordhash = await bcrypt.hash(password, salt);

    var obj = {
        fullname: fullname,
        email: email,
        password: passwordhash,
        profilepic: req.file?.path
    }

    if (!req.file) {
        return res.status(400).send({ message: "Profile picture is required" });
    }


    let query = "SELECT * FROM userinfo WHERE email=?";

    conn.query(query, [email], (err, data) => {

        if (err) {
            res.send(err.message);
        }

        // If data is not empty, it means a user with the same email already exists
        if (data.length > 0) {
            return res.status(400).send({ status: 400, message: "User is already registered" });
        }

        let mailOptions = sendotpmail(email);

        // Send email with OTP (mail sending logic)
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.send(error.message);
            }

            let match = mailOptions.text.match(/(\d+)/);
            let otpToSend = match[0];

            let query = `INSERT INTO practice.userinfo (fullname, email, password, filepath, otp, isverified) VALUES (?,?,?,?,?,?)`;

            // Insert data into the database
            conn.query(query, [obj.fullname, obj.email, obj.password, obj.profilepic, otpToSend, false], (err, data) => {
                if (err) {
                    return res.send({
                        status: 400,
                        message: "Error in sending data",
                    });
                }
                res.send({
                    status: 200,
                    message: "Successfully created",
                    info: data
                });
            });
        });
    });
});

app.post("/login", (req, res) => {
    let { email, password } = req.body;

    let query = "SELECT * FROM practice.userinfo WHERE email= ?";

    conn.query(query, [email], async (err, data) => {
        if (err) {
            console.error("Database query error:", err.message);
            return res.status(500).send({ message: "Database error" });
        }

        let userdata = data[0];

        if (data.length === 0) {
            return res.status(400).send({ status: 400, message: "Invalid Credentials" });
        }

        if (!(userdata.isverified)) {
            return res.status(400).send({
                status: 400,
                message: "User is not verified"
            })
        }

        let isPasswordMatch = await bcrypt.compare(password, userdata.password);

        if ((userdata.email === email) && (isPasswordMatch) && (userdata.isverified === 1)) {
            res.send({
                status: 200,
                message: "Successfully logged",
                data: userdata
            });
        }
        else {
           return res.send({
                status: 400,
                message: "Invalid Credentials"
            });
        }
    });
});

app.post("/verify", (req, res) => {
    let { email, otp } = req.body;

    if(!email){
        return res.send({status:400,message:"Please enter your mail"});
    }

    if(!otp){
        return res.send({status:400,message:"Please enter otp"});
    }

    let query = "SELECT * FROM practice.userinfo WHERE email=?";

    conn.query(query, [email], (err, data) => {
        if (err) {
            return res.send(err.message);
        }

        let userdata = data[0];

        if (!userdata) {
            return res.status(400).send({ message: "Email not found" });
        }

        if (userdata.isverified === 1) {
            return res.send({ status: 400, message: "Already verified" });
        }

        if (userdata.email === email && otp === userdata.otp) {
            let query = "UPDATE practice.userinfo SET isverified=?,otp=? WHERE email=?";
            conn.query(query, [true, null, email], (err, data) => {
                if (err) {
                    return res.status(400).send({ message: "Error verifying email" });
                }
                res.status(200).send({ message: "Successfully verified user" });
            });
        } else {
            res.status(400).send({ message: "Invalid OTP or Email" });
        }


    });
});


// Custom error handler middleware for Multer
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).send({ message: "File size exceeds the 100 KB limit" });
        }
        if (err.code === 'INVALID_FILE_TYPE') {
            return res.status(400).send({ message: "Invalid file type. Only PNG, JPEG, and JPG are allowed." });
        }
        return res.status(400).send({ message: `Multer error: ${err.message}` });
    } else if (err) {
        // Handle other types of errors
        return res.status(500).send({ message: `Server error: ${err.message}` });
    }
    next();
});


var port = process.env.PORT;

app.listen(port, () => {
    console.log("Server started on port");
});
