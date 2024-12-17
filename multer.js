var multer = require("multer");
var path = require("path");

// Define file size limit (100 KB = 100 * 1024 bytes)
const FILE_SIZE_LIMIT = 100 * 1024; // 100 KB

var stored_data = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __dirname + "/files"); // Ensure this folder exists
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Keep the file's original extension
    }
});

var filterdata = (req, file, cb) => {
    const allowedTypes = [".png", ".jpeg", ".jpg"]; // Added .jpg as well
    const fileType = path.extname(file.originalname).toLowerCase(); // Use file.originalname, not Date.now()

    if (!allowedTypes.includes(fileType)) {
        return cb(new Error("Invalid file type. Only PNG, JPEG, and JPG are allowed."),false);
    }

    cb(null, true);
}

var upload = multer({
    storage: stored_data,
    limits: {
        fileSize: FILE_SIZE_LIMIT,  // Set the file size limit to 100 KB
    },
    fileFilter: filterdata
});

module.exports = upload;
