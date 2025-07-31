import mongoose from "mongoose"

// Global variable to track connection attempts
let isConnecting = false
let connectionAttempts = 0
const MAX_RETRY_ATTEMPTS = 3

const connectDB = async () => {
  // Prevent multiple simultaneous connection attempts
  if (isConnecting) {
    console.log("🔄 Connection already in progress...")
    return
  }

  try {
    isConnecting = true
    connectionAttempts++

    // Validate environment variables
    if (!process.env.MONGO_URI) {
      throw new Error("❌ MONGO_URI environment variable is missing")
    }

    console.log(`🔍 Connection attempt ${connectionAttempts}/${MAX_RETRY_ATTEMPTS}`)
    console.log("🔗 MongoDB URI format check:", process.env.MONGO_URI.substring(0, 20) + "...")
    console.log("🌍 Environment:", process.env.NODE_ENV)

    // Close existing connection if any
    if (mongoose.connection.readyState !== 0) {
      console.log("🔄 Closing existing connection...")
      await mongoose.connection.close()
    }

    // Optimized connection options for Vercel
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,

      // Timeout settings optimized for Vercel
      serverSelectionTimeoutMS: 8000, // Reduced for faster failure
      connectTimeoutMS: 8000,
      socketTimeoutMS: 30000,

      // Connection pool settings
      maxPoolSize: 5, // Reduced for serverless
      minPoolSize: 1,
      maxIdleTimeMS: 30000,

      // Retry settings
      retryWrites: true,
      retryReads: true,

      // Buffer settings
      bufferCommands: false,
      bufferMaxEntries: 0,

      // Additional Vercel optimizations
      family: 4, // Force IPv4
      keepAlive: true,
      keepAliveInitialDelay: 300000,

      // Write concern
      w: "majority",
      wtimeoutMS: 5000,
    }

    console.log("🚀 Attempting MongoDB connection...")

    // Set connection timeout
    const connectionPromise = mongoose.connect(process.env.MONGO_URI, options)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Connection timeout after 10 seconds")), 10000)
    })

    const conn = await Promise.race([connectionPromise, timeoutPromise])

    console.log("✅ MongoDB connected successfully!")
    console.log(`📍 Host: ${conn.connection.host}`)
    console.log(`🗄️  Database: ${conn.connection.name}`)
    console.log(`🔗 Connection State: ${conn.connection.readyState}`)

    // Reset connection attempts on success
    connectionAttempts = 0
    isConnecting = false

    // Set up event listeners
    setupConnectionListeners()

    return conn
  } catch (error) {
    isConnecting = false

    console.error(`❌ MongoDB connection failed (Attempt ${connectionAttempts}/${MAX_RETRY_ATTEMPTS}):`)
    console.error("🔍 Error type:", error.name)
    console.error("🔍 Error message:", error.message)

    // Log specific error details
    if (error.code) {
      console.error("🔍 Error code:", error.code)
    }

    // Retry logic for production
    if (process.env.NODE_ENV === "production" && connectionAttempts < MAX_RETRY_ATTEMPTS) {
      console.log(`🔄 Retrying connection in 2 seconds... (${connectionAttempts}/${MAX_RETRY_ATTEMPTS})`)
      setTimeout(() => {
        connectDB()
      }, 2000)
      return null
    }

    // Reset attempts if max reached
    if (connectionAttempts >= MAX_RETRY_ATTEMPTS) {
      console.error("❌ Max connection attempts reached. Giving up.")
      connectionAttempts = 0
    }

    // In production, don't throw error to allow app to start
    if (process.env.NODE_ENV === "production") {
      console.log("🚀 Production mode: App will start without database")
      return null
    }

    throw error
  }
}

const setupConnectionListeners = () => {
  // Remove existing listeners to prevent duplicates
  mongoose.connection.removeAllListeners()

  mongoose.connection.on("connected", () => {
    console.log("🟢 Mongoose connected to MongoDB")
  })

  mongoose.connection.on("error", (err) => {
    console.error("❌ Mongoose connection error:", err.message)
  })

  mongoose.connection.on("disconnected", () => {
    console.log("🔴 Mongoose disconnected from MongoDB")

    // Auto-reconnect in production
    if (process.env.NODE_ENV === "production") {
      console.log("🔄 Attempting auto-reconnect...")
      setTimeout(() => {
        if (mongoose.connection.readyState === 0) {
          connectDB()
        }
      }, 5000)
    }
  })

  mongoose.connection.on("reconnected", () => {
    console.log("🔄 Mongoose reconnected to MongoDB")
  })

  // Handle process termination
  process.on("SIGINT", async () => {
    try {
      await mongoose.connection.close()
      console.log("🔴 Mongoose connection closed due to app termination")
      process.exit(0)
    } catch (error) {
      console.error("Error closing connection:", error)
      process.exit(1)
    }
  })
}

// Export connection status checker
export const isDBConnected = () => {
  return mongoose.connection.readyState === 1
}

// Export manual reconnect function
export const reconnectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return { success: true, message: "Already connected" }
  }

  try {
    await connectDB()
    return { success: true, message: "Reconnected successfully" }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

export default connectDB
