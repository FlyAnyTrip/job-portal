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
    console.log("🔗 MongoDB URI format check:", process.env.MONGO_URI.substring(0, 25) + "...")

    // Close existing connection if any
    if (mongoose.connection.readyState !== 0) {
      console.log("🔄 Closing existing connection...")
      await mongoose.connection.close()
      // Wait a moment for cleanup
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    // 🚀 CORRECTED CONNECTION STRING FORMAT
    let mongoUri = process.env.MONGO_URI

    // 🔥 ENSURE PROPER DATABASE NAME IN URI
    if (!mongoUri.includes("/jobportal?")) {
      // If URI doesn't have database name, add it
      if (mongoUri.includes("?")) {
        mongoUri = mongoUri.replace("/?", "/jobportal?")
      } else {
        mongoUri = mongoUri + "/jobportal?retryWrites=true&w=majority"
      }
    }

    console.log("🔗 Using corrected URI:", mongoUri.substring(0, 25) + "...")

    // 🚀 PRODUCTION-OPTIMIZED CONNECTION OPTIONS
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,

      // 🔥 PRODUCTION TIMEOUTS
      serverSelectionTimeoutMS: 10000, // 10 seconds
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,

      // 🔥 CONNECTION POOL
      maxPoolSize: 5,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,

      // 🔥 RETRY SETTINGS
      retryWrites: true,
      retryReads: true,

      // 🔥 BUFFERING
      bufferCommands: false,
      bufferMaxEntries: 0,

      // 🔥 AUTHENTICATION
      authSource: "admin",

      // 🔥 WRITE CONCERN
      w: "majority",
      wtimeoutMS: 5000,

      // 🔥 READ PREFERENCE
      readPreference: "primary",

      // 🔥 HEARTBEAT
      heartbeatFrequencyMS: 10000,
    }

    console.log("🚀 Attempting MongoDB connection with corrected URI...")

    // Connect with timeout
    const connectionPromise = mongoose.connect(mongoUri, options)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Connection timeout after 15 seconds")), 15000)
    })

    const conn = await Promise.race([connectionPromise, timeoutPromise])

    console.log("✅ MongoDB connected successfully!")
    console.log(`📍 Host: ${conn.connection.host}`)
    console.log(`🗄️  Database: ${conn.connection.name}`)
    console.log(`🔗 Connection State: ${conn.connection.readyState}`)

    // Test the connection with a simple operation
    try {
      await mongoose.connection.db.admin().ping()
      console.log("✅ Database ping successful!")
    } catch (pingError) {
      console.log("⚠️ Database ping failed:", pingError.message)
    }

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

    // Log specific MongoDB errors
    if (error.code) {
      console.error("🔍 Error code:", error.code)
    }
    if (error.codeName) {
      console.error("🔍 Error codeName:", error.codeName)
    }

    // Retry logic
    if (connectionAttempts < MAX_RETRY_ATTEMPTS) {
      console.log(`🔄 Retrying in 2 seconds... (${connectionAttempts}/${MAX_RETRY_ATTEMPTS})`)
      setTimeout(() => {
        connectDB()
      }, 2000)
      return null
    }

    // Reset attempts if max reached
    if (connectionAttempts >= MAX_RETRY_ATTEMPTS) {
      console.error("❌ Max connection attempts reached.")
      connectionAttempts = 0
    }

    // In production, don't throw error to allow app to start
    if (process.env.NODE_ENV === "production") {
      console.log("🚀 Production mode: App will continue without database")
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
    if (process.env.NODE_ENV === "production" && !isConnecting) {
      console.log("🔄 Auto-reconnect attempt...")
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
    console.log("🔄 Manual reconnect initiated...")
    await connectDB()

    // Wait a moment and check connection
    await new Promise((resolve) => setTimeout(resolve, 2000))

    if (mongoose.connection.readyState === 1) {
      return { success: true, message: "Reconnected successfully" }
    } else {
      return { success: false, message: "Reconnection attempted but still disconnected" }
    }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

export default connectDB
