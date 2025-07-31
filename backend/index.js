import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "./utils/db.js"
import userRoute from "./routes/user.route.js"
import companyRoute from "./routes/company.route.js"
import jobRoute from "./routes/job.route.js"
import applicationRoute from "./routes/application.route.js"
import mongoose from "mongoose"

// Load environment variables FIRST
dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

// Log environment variables (without sensitive data)
console.log("🔍 Environment Check:")
console.log("- NODE_ENV:", process.env.NODE_ENV)
console.log("- PORT:", process.env.PORT)
console.log("- MONGO_URI exists:", !!process.env.MONGO_URI)
console.log("- MONGO_URI length:", process.env.MONGO_URI?.length || 0)

// Database connection with error handling
let dbConnected = false
try {
  await connectDB()
  dbConnected = true
} catch (error) {
  console.error("❌ Initial DB connection failed, app will continue")
  dbConnected = false
}

// Middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(cookieParser())

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)

    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://job-portal-topaz-three.vercel.app",
      process.env.FRONTEND_URL,
    ].filter(Boolean)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(null, true) // Allow all for now
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
}

app.use(cors(corsOptions))

// Enhanced health check with better error handling
app.get("/", (req, res) => {
  const dbReadyState = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  }

  const connectionState = mongoose.connection.readyState
  const isConnected = connectionState === 1

  res.json({
    message: "Job Portal API is running!",
    status: "healthy",
    uptime: `${Math.floor(process.uptime())} seconds`,
    timestamp: new Date().toISOString(),
    database: {
      status: isConnected ? "connected" : "disconnected",
      readyState: connectionState,
      readyStateText: dbReadyState[connectionState],
      host: isConnected ? mongoose.connection.host : "Not connected",
      name: isConnected ? mongoose.connection.name : "Not connected",
      collections: isConnected ? Object.keys(mongoose.connection.collections).length : 0,
      mongoUri: process.env.MONGO_URI ? "✅ Set" : "❌ Missing",
      connectionAttempted: dbConnected,
    },
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  })
})

// Detailed health check
app.get("/api/health", async (req, res) => {
  const dbReadyState = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  }

  const connectionState = mongoose.connection.readyState
  const isConnected = connectionState === 1

  const dbDetails = {
    status: isConnected ? "connected" : "disconnected",
    readyState: connectionState,
    readyStateText: dbReadyState[connectionState],
    host: isConnected ? mongoose.connection.host : "Not connected",
    name: isConnected ? mongoose.connection.name : "Not connected",
    collections: isConnected ? Object.keys(mongoose.connection.collections).length : 0,
    lastConnected: null,
    mongoUri: process.env.MONGO_URI ? "✅ Set" : "❌ Missing",
    connectionAttempted: dbConnected,
  }

  // Test connection if connected
  if (isConnected) {
    try {
      await mongoose.connection.db.admin().ping()
      dbDetails.pingTest = "success"
      dbDetails.lastConnected = new Date().toISOString()
    } catch (error) {
      dbDetails.pingTest = "failed"
      dbDetails.error = error.message
    }
  } else {
    // Try to reconnect if disconnected
    try {
      console.log("🔄 Attempting to reconnect to database...")
      await connectDB()
      dbDetails.reconnectAttempt = "success"
    } catch (error) {
      dbDetails.reconnectAttempt = "failed"
      dbDetails.reconnectError = error.message
    }
  }

  res.json({
    status: "healthy",
    uptime: `${Math.floor(process.uptime())} seconds`,
    timestamp: new Date().toISOString(),
    database: dbDetails,
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
    memory: {
      used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
      total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
    },
  })
})

// Database reconnection endpoint
app.post("/api/health/reconnect", async (req, res) => {
  try {
    console.log("🔄 Manual database reconnection requested...")

    if (mongoose.connection.readyState === 1) {
      return res.json({
        success: true,
        message: "Database is already connected",
        status: "connected",
      })
    }

    await connectDB()

    res.json({
      success: true,
      message: "Database reconnection successful",
      status: "connected",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database reconnection failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
})

// API routes
app.use("/api/v1/user", userRoute)
app.use("/api/v1/company", companyRoute)
app.use("/api/v1/job", jobRoute)
app.use("/api/v1/application", applicationRoute)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message)
  res.status(500).json({
    message: "Internal server error",
    success: false,
    error: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
    success: false,
  })
})

// Start server
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
  })
}

export default app
