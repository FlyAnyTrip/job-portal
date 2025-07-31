import mongoose from "mongoose"

// Simple connection function
const connectDB = async () => {
  try {
    console.log("🚀 Starting MongoDB connection...")

    // Validate MONGO_URI
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from environment variables")
    }

    console.log("✅ MONGO_URI found")
    console.log("🔗 URI preview:", process.env.MONGO_URI.substring(0, 30) + "...")

    // Disconnect if already connected
    if (mongoose.connection.readyState !== 0) {
      console.log("🔄 Closing existing connection...")
      await mongoose.connection.close()
    }

    // SUPER SIMPLE CONNECTION OPTIONS
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
      connectTimeoutMS: 10000,
      family: 4, // Use IPv4
    }

    console.log("🔌 Attempting connection...")

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, options)

    console.log("✅ MongoDB Connected Successfully!")
    console.log("📍 Host:", mongoose.connection.host)
    console.log("🗄️ Database:", mongoose.connection.name)
    console.log("🔗 Ready State:", mongoose.connection.readyState)

    // Test connection with ping
    await mongoose.connection.db.admin().ping()
    console.log("✅ Database ping successful!")

    return mongoose.connection
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:")
    console.error("Error Name:", error.name)
    console.error("Error Message:", error.message)

    // Log specific MongoDB errors
    if (error.code) console.error("Error Code:", error.code)
    if (error.codeName) console.error("Error Code Name:", error.codeName)

    // Don't throw in production - let app start
    if (process.env.NODE_ENV === "production") {
      console.log("🚀 Production: App starting without DB")
      return null
    }

    throw error
  }
}

// Connection status checker
export const isDBConnected = () => {
  return mongoose.connection.readyState === 1
}

// Force reconnect function
export const forceReconnect = async () => {
  try {
    console.log("🔄 Force reconnecting...")

    // Close existing connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close()
      console.log("🔄 Existing connection closed")
    }

    // Wait a moment
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Reconnect
    const connection = await connectDB()

    if (mongoose.connection.readyState === 1) {
      return { success: true, message: "Reconnected successfully!" }
    } else {
      return { success: false, message: "Reconnection failed - still disconnected" }
    }
  } catch (error) {
    console.error("❌ Force reconnect failed:", error.message)
    return { success: false, message: error.message }
  }
}

// Get detailed connection status
export const getConnectionStatus = () => {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  }

  const readyState = mongoose.connection.readyState

  return {
    readyState,
    status: states[readyState] || "unknown",
    isConnected: readyState === 1,
    host: mongoose.connection.host || "Not connected",
    database: mongoose.connection.name || "Not connected",
    collections: readyState === 1 ? Object.keys(mongoose.connection.collections).length : 0,
  }
}

export default connectDB
