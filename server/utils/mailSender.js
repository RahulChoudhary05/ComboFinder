const nodemailer = require("nodemailer");
const fs = require("fs");
require("dotenv").config();

const sendMail = async (to, subject, text, htmlContent, logoFilePath) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false, // True for port 465, false for others
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Check if the logo file exists
    if (!fs.existsSync(logoFilePath)) {
      throw new Error(`Logo file not found at path: ${logoFilePath}`);
    }

    // Configure email options
    const mailOptions = {
      from: `"ComboFinder" <${process.env.MAIL_USER}>`,
      to,
      subject,
      text,
      html: htmlContent, // Include provided HTML content
      attachments: [
        {
          filename: "logo.svg",
          path: logoFilePath, // File should be resolved here
          cid: "logo", // Same CID to embed in the email content
        },
      ],
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = { sendMail };
