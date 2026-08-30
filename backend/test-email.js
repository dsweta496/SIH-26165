require("dotenv").config();

const { sendEmail } = require("./services/email.service");

const testEmail = async () => {
    try {
        const info = await sendEmail({
            to: process.env.GMAIL_USER,
            subject: "OIL SIF Backend - Email Test",
            text: "This is a test email from the OIL SIF backend.",
            html: `
                <h2>OIL SIF Backend Email Test</h2>
                <p>This email confirms that Gmail SMTP is working correctly.</p>
            `,
        });

        console.log("Email sent successfully:", info.messageId);
    } catch (error) {
        console.error("Email test failed:", error.message);
    }
};

testEmail();