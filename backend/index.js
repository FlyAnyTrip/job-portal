// import express from "express"
// import cookieParser from "cookie-parser"
// import cors from "cors"
// import dotenv from "dotenv"
// import connectDB from "./utils/db.js"
// import userRoute from "./routes/user.route.js"
// import companyRoute from "./routes/company.route.js"
// import jobRoute from "./routes/job.route.js"
// import applicationRoute from "./routes/application.route.js"

// dotenv.config({})

// const app = express()

// // middleware
// app.use(express.json())
// app.use(express.urlencoded({ extended: true }))
// app.use(cookieParser())

// const corsOptions = {
//   origin: ["http://localhost:5173", "http://localhost:3000"],
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
// }

// app.use(cors(corsOptions))

// const PORT = process.env.PORT || 3000

// // Test route
// app.get("/test", (req, res) => {
//   res.json({ message: "Server is working!" })
// })

// // api's
// app.use("/api/v1/user", userRoute)
// app.use("/api/v1/company", companyRoute)
// app.use("/api/v1/job", jobRoute)
// app.use("/api/v1/application", applicationRoute)

// app.listen(PORT, () => {
//   connectDB()
//   console.log(`Server running at port ${PORT}`)
// })



// for deployment //

import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "./utils/db.js"
import userRoute from "./routes/user.route.js"
import companyRoute from "./routes/company.route.js"
import jobRoute from "./routes/job.route.js"
import applicationRoute from "./routes/application.route.js"

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
      "https://your-frontend-app.vercel.app", // Replace with your actual frontend URL
      process.env.FRONTEND_URL,
    ].filter(Boolean)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
}

app.use(cors(corsOptions))

// Health check route
app.get("/", (req, res) => {
  res.json({
    message: "Job Portal API is running!",
    status: "success",
    timestamp: new Date().toISOString(),
  })
})

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
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

// Start server (only in development)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`)
  })
}

// Export for Vercel
export default app
