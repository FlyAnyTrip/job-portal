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

    // 🚀 VERCEL-OPTIMIZED CONNECTION OPTIONS
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,

      // 🔥 AGGRESSIVE TIMEOUT SETTINGS FOR VERCEL
      serverSelectionTimeoutMS: 5000, // Reduced from 8000
      connectTimeoutMS: 5000, // Reduced from 8000
      socketTimeoutMS: 20000, // Reduced from 30000

      // 🔥 MINIMAL CONNECTION POOL FOR SERVERLESS
      maxPoolSize: 3, // Reduced from 5
      minPoolSize: 0, // Reduced from 1
      maxIdleTimeMS: 10000, // Reduced from 30000

      // 🔥 FAST RETRY SETTINGS
      retryWrites: true,
      retryReads: true,

      // 🔥 DISABLE BUFFERING FOR SERVERLESS
      bufferCommands: false,
      bufferMaxEntries: 0,

      // 🔥 VERCEL-SPECIFIC OPTIMIZATIONS
      family: 4, // Force IPv4
      keepAlive: false, // Disable for serverless

      // 🔥 FAST WRITE CONCERN
      w: "majority",
      wtimeoutMS: 3000, // Reduced from 5000

      // 🔥 ADDITIONAL SERVERLESS OPTIMIZATIONS
      heartbeatFrequencyMS: 10000, // Less frequent heartbeats
      serverSelectionRetryDelayMS: 1000, // Faster retries
    }

    console.log("🚀 Attempting MongoDB connection with Vercel-optimized settings...")

    // 🔥 SHORTER CONNECTION TIMEOUT FOR VERCEL
    const connectionPromise = mongoose.connect(process.env.MONGO_URI, options)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Connection timeout after 6 seconds")), 6000)
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

    // 🔥 FASTER RETRY FOR VERCEL
    if (process.env.NODE_ENV === "production" && connectionAttempts < MAX_RETRY_ATTEMPTS) {
      console.log(`🔄 Retrying connection in 1 second... (${connectionAttempts}/${MAX_RETRY_ATTEMPTS})`)
      setTimeout(() => {
        connectDB()
      }, 1000) // Reduced from 2000
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

    // 🔥 FASTER AUTO-RECONNECT FOR VERCEL
    if (process.env.NODE_ENV === "production") {
      console.log("🔄 Attempting auto-reconnect...")
      setTimeout(() => {
        if (mongoose.connection.readyState === 0) {
          connectDB()
        }
      }, 2000) // Reduced from 5000
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
