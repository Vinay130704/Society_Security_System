const multer = require("multer");
const fs = require("fs");

// ✅ Ensure Upload Directory Exists
const createUploadDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// ✅ Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = "uploads/visitor_images/";
        createUploadDir(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

module.exports = multer({ storage });
