import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import mongoose from "mongoose" // Added mongoose import for database health check
import connectDB from "./utils/db.js"
import userRoute from "./routes/user.route.js"
import companyRoute from "./routes/company.route.js"
import jobRoute from "./routes/job.route.js"
import applicationRoute from "./routes/application.route.js"

dotenv.config({})

const app = express()

// middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://alis-job-portal.vercel.app", // Added your frontend URL
    "https://job-portal-rho-bice.vercel.app", // Added new frontend URL
    process.env.FRONTEND_URL || "https://your-app-name.vercel.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
}

app.use(cors(corsOptions))

app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (error) {
    console.error("Database connection failed:", error)
    res.status(503).json({
      error: "Database connection failed",
      message: error.message,
    })
  }
})

const PORT = process.env.PORT || 3000

// Root route for Vercel deployment
app.get("/", (req, res) => {
  res.json({ message: "Job Portal API is running!" })
})

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "Server is working!" })
})

app.get("/health", async (req, res) => {
  try {
    const dbStatus = {
      connected: mongoose.connection.readyState === 1,
      state: getConnectionState(mongoose.connection.readyState),
      host: mongoose.connection.host || "Not connected",
      name: mongoose.connection.name || "Not connected",
    }

    // Test database ping with timeout
    let dbPing = null
    let dbError = null

    if (dbStatus.connected) {
      try {
        const startTime = Date.now()
        await Promise.race([
          mongoose.connection.db.admin().ping(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000)),
        ])
        dbPing = Date.now() - startTime
      } catch (error) {
        dbError = error.message
      }
    }

    const healthStatus = dbStatus.connected && !dbError ? "healthy" : "unhealthy"

    res.status(healthStatus === "healthy" ? 200 : 503).json({
      status: healthStatus,
      message: "Job Portal API Health Check",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
      database: {
        ...dbStatus,
        ping: dbPing ? `${dbPing}ms` : "N/A",
        error: dbError || null,
        lastChecked: new Date().toISOString(),
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB",
      },
    })
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      message: "Health check failed",
      error: error.message,
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: "Health check exception: " + error.message,
      },
    })
  }
})

function getConnectionState(state) {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  }
  return states[state] || "unknown"
}

// api's
app.use("/api/v1/user", userRoute)
app.use("/api/v1/company", companyRoute)
app.use("/api/v1/job", jobRoute)
app.use("/api/v1/application", applicationRoute)

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`)
  })
}

export default app
