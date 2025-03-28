const express = require("express");
const { sendMail } = require("../utils/mailSender");
const path = require("path");

const router = express.Router();

router.post("/sendemail", async (req, res) => {
  const { to, subject, text, html } = req.body;

  // Validate subscriber payload
  if (!to || !subject || (!text && !html)) {
    return res
      .status(400)
      .json({ message: "Please provide 'to', 'subject', and 'text' or 'html' fields." });
  }

  try {
    // Resolve the correct logo path
    const logoPath = path.resolve(__dirname, "../public/logo.svg");

    // Send email
    const info = await sendMail(to, subject, text, html, logoPath);
    res.status(200).json({ message: "Email sent successfully", info });
  } catch (error) {
    console.error("Error in mail router:", error);
    res
      .status(500)
      .json({ message: "Failed to send email", error: error.message });
  }
});

module.exports = router;
