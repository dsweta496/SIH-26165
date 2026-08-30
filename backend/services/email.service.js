const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

const sendEmail = async ({ to, subject, text, html }) => {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        throw new Error("Gmail email configuration is missing");
    }

    const mailOptions = {
        from: `"OIL SIF Safety System" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        text,
        html,
    };

    const info = await transporter.sendMail(mailOptions);

    return info;
};

module.exports = {
    sendEmail,
};