import nodemailer from 'nodemailer'
import util from 'util'
const sendeticketmail = async (sendtoemail, ticketNO,userName) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,      // Your email
            pass: process.env.PASSWORD    // App password (not your real password)
        }
    });
    const otpEmailTemplateHTML = (ticketNO,userName) => 
`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ticket Confirmation</title>
  <style>
    /* Base Styles */
    body { margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .wrapper { width: 100%; background-color: #f4f6f8; padding: 40px 0; }
    .container { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden; }
    
    /* Header */
    .header { background-color: #2563eb; padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 0.5px; }
    
    /* Content */
    .content { padding: 40px 30px; }
    .text-primary { font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 20px; }
    .text-secondary { font-size: 14px; color: #6b7280; line-height: 1.5; margin-top: 30px; }
    
    /* Ticket Box (The Hero Section) */
    .ticket-box { 
      background-color: #f3f4f6; 
      border: 2px dashed #d1d5db; 
      border-radius: 8px; 
      padding: 25px; 
      text-align: center; 
      margin: 25px 0; 
    }
    .ticket-label { display: block; font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: 700; letter-spacing: 1px; margin-bottom: 5px; }
    .ticket-id { display: block; font-size: 32px; font-weight: 800; color: #111827; letter-spacing: 2px; font-family: 'Courier New', monospace; }
    .ticket-subject { display: block; font-size: 14px; color: #4b5563; margin-top: 8px; font-style: italic; }

    /* Button */
    .btn-container { text-align: center; margin-top: 30px; }
    .btn { background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 6px; font-weight: 600; display: inline-block; }
    .btn:hover { background-color: #1d4ed8; }
    
    /* Footer */
    .footer { background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer-text { font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      
      <div class="header">
        <h1>Support Request Received</h1>
      </div>

      <div class="content">
        <p class="text-primary">Hi <strong>${userName}</strong>,</p>
        <p class="text-primary">
          We have successfully received your support request. Our team is reviewing it and will get back to you shortly.
        </p>

        <div class="ticket-box">
          <span class="ticket-label">Ticket Reference ID</span>
          <span class="ticket-id">${ticketNO}</span>
        </div>

        <div class="btn-container">
          <a href="https://support.bitnextro.com/${ticketNO}" class="btn">View Ticket Status</a>
        </div>
        
        <p class="text-secondary">
          If you have additional details to add, simply reply to this email or click the button above.
        </p>
      </div>

      <div class="footer">
        <p class="footer-text">
          &copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.
        </p>
      </div>
      
    </div>
  </div>
</body>
</html>
  `;

    const mailOptions = {
        from: process.env.EMAIL,    // Fixed the `from` field
        to: sendtoemail,
        subject: "Your Ticket No",
        html: otpEmailTemplateHTML(ticketNO,userName),
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
export default sendeticketmail;