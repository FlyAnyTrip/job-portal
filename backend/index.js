import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import connectDB, { reconnectDB } from "./utils/db.js"
import userRoute from "./routes/user.route.js"
import companyRoute from "./routes/company.route.js"
import jobRoute from "./routes/job.route.js"
import applicationRoute from "./routes/application.route.js"
import mongoose from "mongoose"

// Load environment variables FIRST
dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

// Environment validation
console.log("🔍 Environment Validation:")
console.log("- NODE_ENV:", process.env.NODE_ENV)
console.log("- PORT:", process.env.PORT)
console.log("- MONGO_URI exists:", !!process.env.MONGO_URI)
console.log("- SECRET_KEY exists:", !!process.env.SECRET_KEY)

// Initialize database connection
let dbInitialized = false
const initializeDB = async () => {
  try {
    console.log("🚀 Initializing database connection...")
    await connectDB()
    dbInitialized = true
    console.log("✅ Database initialization completed")
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message)
    dbInitialized = false
  }
}

// Start DB initialization (non-blocking)
initializeDB()

// Middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(cookieParser())

// Enhanced CORS
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)

    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://job-portal-topaz-three.vercel.app",
      process.env.FRONTEND_URL,
    ].filter(Boolean)

    if (process.env.NODE_ENV === "development") {
      return callback(null, true)
    }

    callback(null, true) // Allow all for now
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  optionsSuccessStatus: 200,
}

app.use(cors(corsOptions))

// Database status helper
function getDBStatus() {
  const readyStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  }

  const readyState = mongoose.connection.readyState
  const isConnected = readyState === 1

  return {
    status: isConnected ? "connected" : "disconnected",
    readyState,
    readyStateText: readyStates[readyState],
    host: isConnected ? mongoose.connection.host : "Not connected",
    name: isConnected ? mongoose.connection.name : "Not connected",
    collections: isConnected ? Object.keys(mongoose.connection.collections).length : 0,
    mongoUri: process.env.MONGO_URI ? "✅ Configured" : "❌ Missing",
    initialized: dbInitialized,
  }
}

// 🚀 ROOT ROUTE
app.get("/", (req, res) => {
  const dbStatus = getDBStatus()

  res.json({
    message: "🚀 Job Portal API is running!",
    status: "healthy",
    uptime: `${Math.floor(process.uptime())} seconds`,
    timestamp: new Date().toISOString(),
    database: dbStatus,
    environment: process.env.NODE_ENV || "development",
    version: "1.0.3",
    server: "Vercel Serverless",
  })
})

// 🚀 HEALTH CHECK ROUTE
app.get("/api/health", async (req, res) => {
  const dbStatus = getDBStatus()

  // Try to ping database if connected
  if (dbStatus.readyState === 1) {
    try {
      await mongoose.connection.db.admin().ping()
      dbStatus.pingTest = "✅ Success"
      dbStatus.lastPing = new Date().toISOString()
    } catch (error) {
      dbStatus.pingTest = "❌ Failed"
      dbStatus.pingError = error.message
    }
  }

  res.json({
    status: "healthy",
    uptime: `${Math.floor(process.uptime())} seconds`,
    timestamp: new Date().toISOString(),
    database: dbStatus,
    environment: process.env.NODE_ENV || "development",
    version: "1.0.3",
    memory: {
      used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
      total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
    },
  })
})

// 🚀 MANUAL RECONNECTION ENDPOINT
app.post("/api/health/reconnect", async (req, res) => {
  try {
    console.log("🔄 Manual reconnection requested...")
    const result = await reconnectDB()

    res.json({
      success: result.success,
      message: result.message,
      timestamp: new Date().toISOString(),
      database: getDBStatus(),
    })
  } catch (error) {
    console.error("❌ Reconnection error:", error)
    res.status(500).json({
      success: false,
      message: "Reconnection failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
})

// 🚀 GET METHOD FOR EASIER TESTING
app.get("/api/health/reconnect", async (req, res) => {
  try {
    console.log("🔄 Manual reconnection requested via GET...")
    const result = await reconnectDB()

    res.json({
      success: result.success,
      message: result.message,
      timestamp: new Date().toISOString(),
      database: getDBStatus(),
    })
  } catch (error) {
    console.error("❌ Reconnection error:", error)
    res.status(500).json({
      success: false,
      message: "Reconnection failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
})

// API Routes
app.use("/api/v1/user", userRoute)
app.use("/api/v1/company", companyRoute)
app.use("/api/v1/job", jobRoute)
app.use("/api/v1/application", applicationRoute)

// Error handling
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message)
  res.status(500).json({
    message: "Internal server error",
    success: false,
    error: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
    success: false,
  })
})

// For local development
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
  })
}

export default app
