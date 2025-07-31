import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import mongoose from "mongoose" // Declare mongoose variable
import connectDB, { forceReconnect, getConnectionStatus, isDBConnected } from "./utils/db.js"
import userRoute from "./routes/user.route.js"
import companyRoute from "./routes/company.route.js"
import jobRoute from "./routes/job.route.js"
import applicationRoute from "./routes/application.route.js"

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

console.log("🚀 Starting Job Portal API...")
console.log("📍 Environment:", process.env.NODE_ENV)
console.log("🔑 MONGO_URI exists:", !!process.env.MONGO_URI)
console.log("🔑 SECRET_KEY exists:", !!process.env.SECRET_KEY)

// Initialize database (non-blocking)
connectDB().catch((err) => {
  console.error("❌ Initial DB connection failed:", err.message)
})

// Middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(cookieParser())

// CORS
app.use(
  cors({
    origin: true, // Allow all origins for now
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  }),
)

// 🏠 HOME ROUTE
app.get("/", (req, res) => {
  const dbStatus = getConnectionStatus()

  res.json({
    message: "🚀 Job Portal API is LIVE!",
    status: "healthy",
    timestamp: new Date().toISOString(),
    database: dbStatus,
    version: "2.0.0",
    endpoints: {
      health: "/api/health",
      reconnect: "/api/reconnect",
      test: "/api/test-db",
    },
  })
})

// 🏥 HEALTH CHECK
app.get("/api/health", async (req, res) => {
  const dbStatus = getConnectionStatus()

  // Try ping if connected
  if (dbStatus.isConnected) {
    try {
      await mongoose.connection.db.admin().ping()
      dbStatus.pingTest = "✅ Success"
    } catch (error) {
      dbStatus.pingTest = "❌ Failed: " + error.message
    }
  }

  res.json({
    status: "healthy",
    uptime: Math.floor(process.uptime()) + " seconds",
    timestamp: new Date().toISOString(),
    database: dbStatus,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
    },
  })
})

// 🔄 RECONNECT ENDPOINT
app.get("/api/reconnect", async (req, res) => {
  console.log("🔄 Reconnect requested...")

  const result = await forceReconnect()
  const dbStatus = getConnectionStatus()

  res.json({
    ...result,
    timestamp: new Date().toISOString(),
    database: dbStatus,
  })
})

// 🧪 TEST DATABASE
app.get("/api/test-db", async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.json({
        success: false,
        message: "Database not connected",
        database: getConnectionStatus(),
      })
    }

    // Try to list collections
    const collections = await mongoose.connection.db.listCollections().toArray()

    res.json({
      success: true,
      message: "Database test successful!",
      collections: collections.map((c) => c.name),
      database: getConnectionStatus(),
    })
  } catch (error) {
    res.json({
      success: false,
      message: "Database test failed: " + error.message,
      database: getConnectionStatus(),
    })
  }
})

// 🔧 DEBUG MONGO URI
app.get("/api/debug", (req, res) => {
  const uri = process.env.MONGO_URI

  if (!uri) {
    return res.json({ error: "MONGO_URI not found" })
  }

  // Parse URI safely
  const parts = {
    hasProtocol: uri.startsWith("mongodb"),
    hasCredentials: uri.includes("@"),
    hasDatabase: uri.split("/").length > 3,
    hasOptions: uri.includes("?"),
    length: uri.length,
    preview: uri.substring(0, 20) + "..." + uri.substring(uri.length - 20),
  }

  res.json({
    configured: true,
    format: parts,
    timestamp: new Date().toISOString(),
  })
})

// API Routes
app.use("/api/v1/user", userRoute)
app.use("/api/v1/company", companyRoute)
app.use("/api/v1/job", jobRoute)
app.use("/api/v1/application", applicationRoute)

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message)
  res.status(500).json({
    message: "Internal server error",
    success: false,
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
    success: false,
  })
})

// Start server (local only)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
  })
}

export default app
