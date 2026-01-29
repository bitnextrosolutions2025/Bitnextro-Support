import nodemailer from 'nodemailer'
import util from 'util'
const sendemail = async (sendtoemail, username, password) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,      // Your email
            pass: process.env.PASSWORD    // App password (not your real password)
        }
    });
    const otpEmailTemplateHTML = (username, password) => `
<!DOCTYPE html>
<html>
<head>
<style>
    .container {
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: auto;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 10px;
        background-color: #f9f9f9;
    }
    .credential-box {
        background-color: #ffffff;
        border: 1px solid #eee;
        padding: 15px;
        border-radius: 5px;
        margin: 20px 0;
    }
    .label {
        font-size: 14px;
        color: #555;
        margin-bottom: 5px;
    }
    .value {
        font-size: 18px;
        font-weight: bold;
        color: #333;
        margin-bottom: 15px;
        font-family: 'Courier New', Courier, monospace; /* Monospace for clarity */
    }
    .value:last-child {
        margin-bottom: 0;
    }
    .alert-text {
        color: #d9534f;
        font-size: 13px;
        font-weight: bold;
    }
    .footer {
        margin-top: 20px;
        font-size: 12px;
        color: #555;
        border-top: 1px solid #ddd;
        padding-top: 10px;
    }
</style>
</head>
<body>

<div class="container">
    <h2>Welcome Onboard!</h2>
    <p>Hello,</p>
    <p>Your account has been successfully created. Please find your login credentials below:</p>

    <div class="credential-box">
        <div class="label">Username:</div>
        <div class="value">${username}</div>
        
        <div class="label">Password:</div>
        <div class="value">${password}</div>
    </div>

    <p>Please login and change your password immediately to ensure account security.</p>
    <p class="alert-text">Keep these credentials safe and do not share them with anyone.</p>

    <div class="footer">
        <p>Best regards,<br>
        <strong>Bitnextro Solution Pvt. Ltd.</strong><br>
        info@bitnextro.com | https://www.bitnextro.com</p>
    </div>
</div>

</body>
</html>
    `;

    const mailOptions = {
        from: process.env.EMAIL,    // Fixed the `from` field
        to: sendtoemail,
        subject: "Your login credentials",
        html: otpEmailTemplateHTML(username,password),
    };

    // Convert sendMail to return a promise
    const sendMailAsync = util.promisify(transporter.sendMail.bind(transporter));

    try {
        const info = await sendMailAsync(mailOptions);
        console.log("✅ Email sent:", info.response);
        return info.response;  // Return the response
    } catch (error) {
        console.error("❌ Error sending email:", error);
        throw error;   // Throw error for proper handling
    }
}
export default sendemail;