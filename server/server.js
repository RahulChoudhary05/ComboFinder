const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const mailRouter = require("./routes/mailRouter");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allow Cross-Origin requests
app.use(cors());

// Configure body parsing with increased payload limits
app.use(bodyParser.json({ limit: "50mb" })); // Increased payload size limit for JSON
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true })); // Increased size limit for URL encoded data

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api/mail", mailRouter);

// Health-check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Serve the logo file if required directly in the browser
app.get("/logo", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "logo.svg"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
