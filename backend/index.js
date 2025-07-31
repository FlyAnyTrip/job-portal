import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "./utils/db.js"
import userRoute from "./routes/user.route.js"
import companyRoute from "./routes/company.route.js"
import jobRoute from "./routes/job.route.js"
import applicationRoute from "./routes/application.route.js"
import mongoose from "mongoose" // Import mongoose to check connection state

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

// Database connection
connectDB()

// Middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(cookieParser())

// CORS configuration for production
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true)

    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      process.env.FRONTEND_URL, // Use environment variable for frontend URL
    ].filter(Boolean)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      // For now, allow all origins for easier testing.
      // In production, you should restrict this to known origins.
      callback(null, true)
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
}

app.use(cors(corsOptions))

// Enhanced health check route for the root URL
app.get("/", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  const dbReadyState = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  }

  res.json({
    message: "Job Portal API is running!",
    status: "healthy",
    uptime: `${Math.floor(process.uptime())} seconds`,
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      readyState: mongoose.connection.readyState,
      readyStateText: dbReadyState[mongoose.connection.readyState],
      host: mongoose.connection.host || "Not connected",
      name: mongoose.connection.name || "Not connected",
      collections: mongoose.connection.readyState === 1 ? Object.keys(mongoose.connection.collections).length : 0,
    },
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  })
})

// Detailed health check route for /api/health
app.get("/api/health", async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  const dbReadyState = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  }

  let dbDetails = {
    status: dbStatus,
    readyState: mongoose.connection.readyState,
    readyStateText: dbReadyState[mongoose.connection.readyState],
    host: "Not connected",
    name: "Not connected",
    collections: 0,
    lastConnected: null,
  }

  // Get detailed DB info if connected
  if (mongoose.connection.readyState === 1) {
    try {
      dbDetails = {
        ...dbDetails,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        collections: Object.keys(mongoose.connection.collections).length,
        lastConnected: new Date().toISOString(),
      }

      // Test database with a simple query
      await mongoose.connection.db.admin().ping()
      dbDetails.pingTest = "success"
    } catch (error) {
      dbDetails.pingTest = "failed"
      dbDetails.error = error.message
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

// Database-specific health check route
app.get("/api/health/database", async (req, res) => {
  const dbReadyState = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      status: "unhealthy",
      database: {
        status: "disconnected",
        readyState: mongoose.connection.readyState,
        readyStateText: dbReadyState[mongoose.connection.readyState],
        message: "Database is not connected",
      },
      timestamp: new Date().toISOString(),
    })
  }

  try {
    // Test database connection with ping
    await mongoose.connection.db.admin().ping()

    // Get database stats
    const stats = await mongoose.connection.db.stats()

    res.json({
      status: "healthy",
      database: {
        status: "connected",
        readyState: mongoose.connection.readyState,
        readyStateText: "connected",
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        collections: Object.keys(mongoose.connection.collections).length,
        stats: {
          collections: stats.collections,
          dataSize: `${Math.round(stats.dataSize / 1024 / 1024)} MB`,
          storageSize: `${Math.round(stats.storageSize / 1024 / 1024)} MB`,
          indexes: stats.indexes,
        },
        pingTest: "success",
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      database: {
        status: "error",
        readyState: mongoose.connection.readyState,
        readyStateText: dbReadyState[mongoose.connection.readyState],
        error: error.message,
        pingTest: "failed",
      },
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

// Export for Vercel
export default app
