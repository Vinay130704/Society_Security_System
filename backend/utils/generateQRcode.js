const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

const generateQRCode = async (data) => {
    try {
        // Define the directory for storing QR codes
        const qrDir = path.join(__dirname, "../uploads/qrcodes");
        
        // Ensure the directory exists
        if (!fs.existsSync(qrDir)) {
            fs.mkdirSync(qrDir, { recursive: true });
        }

        // Generate QR code file path
        const qrPath = path.join(qrDir, `${data}.png`);

        // Generate QR Code and save to file
        await QRCode.toFile(qrPath, data);

        return qrPath;  // Return the saved file path
    } catch (error) {
        console.error("QR Code Generation Failed:", error);
        return null;
    }
};

module.exports = generateQRCode;
