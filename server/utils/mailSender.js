const nodemailer = require("nodemailer")

let transporter = null

function getTransporter() {
  if (transporter) return transporter
  const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS } = process.env
  if (!MAIL_HOST || !MAIL_USER || !MAIL_PASS) throw new Error("Mail server is not configured (MAIL_HOST / MAIL_USER / MAIL_PASS).")
  const port = Number(MAIL_PORT) || 587
  // Reuse one pooled SMTP connection instead of creating a transporter per request.
  transporter = nodemailer.createTransport({
    host: MAIL_HOST.trim(),
    port,
    secure: port === 465,
    pool: true,
    auth: { user: MAIL_USER.trim(), pass: MAIL_PASS.trim() },
  })
  return transporter
}

async function sendMail({ to, subject, text, html, attachments = [] }) {
  return getTransporter().sendMail({
    from: `"ComboFinder" <${process.env.MAIL_USER.trim()}>`,
    to,
    subject,
    text,
    html,
    attachments,
  })
}

module.exports = { sendMail }
