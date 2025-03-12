const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, htmlContent) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: "your-email@gmail.com",
                pass: "your-email-password"
            }
        });

        await transporter.sendMail({
            from: '"Security System" <your-email@gmail.com>',
            to,
            subject,
            html: htmlContent
        });

        console.log(`Email Sent to ${to}: ${subject}`);
    } catch (error) {
        console.error(" Email Sending Failed:", error);
    }
};

module.exports = sendEmail;
