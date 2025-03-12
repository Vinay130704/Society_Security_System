const QRCode = require("qrcode");

const generateQRCode = async (data) => {
    try {
        return await QRCode.toDataURL(data);
    } catch (error) {
        console.error("QR Code Generation Failed:", error);
        return null;
    }
};

module.exports = generateQRCode;
