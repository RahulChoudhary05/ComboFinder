require("dotenv").config()
const express = require("express")
const cors = require("cors")
const mailRouter = require("./routes/mailRouter")

const app = express()
const PORT = process.env.PORT || 5000

// Only the deployed frontend (and local dev) may call the API from a browser.
const allowed = (process.env.ALLOWED_ORIGINS || "https://combofinder.vercel.app,http://localhost:3000,http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)

app.disable("x-powered-by")
app.set("trust proxy", 1) // Render/Vercel sit behind a proxy – needed for per-IP rate limiting
app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || allowed.includes(origin)),
    methods: ["POST", "GET"],
  }),
)
app.use(express.json({ limit: "1mb" }))

app.use("/api/mail", mailRouter)

app.get("/health", (req, res) => res.json({ status: "ok" }))

app.use((err, req, res, next) => {
  if (err.type === "entity.too.large") return res.status(413).json({ message: "Payload too large." })
  if (err.type === "entity.parse.failed") return res.status(400).json({ message: "Invalid JSON." })
  console.error(err)
  res.status(500).json({ message: "Internal server error." })
})

app.listen(PORT, () => console.log(`ComboFinder API listening on http://localhost:${PORT}`))
