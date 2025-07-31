import mongoose from "mongoose"

const connectDB = async () => {
  try {
    // Check if MONGO_URI exists
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined")
    }

    console.log("🔍 Attempting to connect to MongoDB...")
    console.log("🔗 MongoDB URI exists:", !!process.env.MONGO_URI)
    console.log("🌍 Environment:", process.env.NODE_ENV || "development")

    // Enhanced connection options for Vercel
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Increased timeout for Vercel
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      bufferCommands: false,
      bufferMaxEntries: 0,
      // Additional options for better Vercel compatibility
      retryWrites: true,
      w: "majority",
      connectTimeoutMS: 10000,
      family: 4, // Use IPv4, skip trying IPv6
    }

    // Connect with retry logic
    const conn = await mongoose.connect(process.env.MONGO_URI, options)

    console.log("✅ MongoDB connected successfully")
    console.log(`📍 Host: ${conn.connection.host}`)
    console.log(`🗄️  Database: ${conn.connection.name}`)
    console.log(`🔗 Connection State: ${conn.connection.readyState}`)
    console.log(`🏷️  Collections: ${Object.keys(conn.connection.collections).length}`)

    // Connection event listeners
    mongoose.connection.on("connected", () => {
      console.log("🟢 Mongoose connected to MongoDB")
    })

    mongoose.connection.on("error", (err) => {
      console.error("❌ Mongoose connection error:", err.message)
    })

    mongoose.connection.on("disconnected", () => {
      console.log("🔴 Mongoose disconnected from MongoDB")
    })

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 Mongoose reconnected to MongoDB")
    })

    // Handle application termination
    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close()
        console.log("🔴 Mongoose connection closed due to application termination")
        process.exit(0)
      } catch (error) {
        console.error("Error closing mongoose connection:", error)
        process.exit(1)
      }
    })

    return conn
  } catch (error) {
    console.error("❌ MongoDB connection failed:")
    console.error("🔍 Error message:", error.message)
    console.error("🔍 Error code:", error.code)
    console.error("🔍 Full error:", error)

    // For Vercel, we should still allow the app to start even if DB fails initially
    console.log("⚠️  App will continue without database connection")

    // Set up retry mechanism
    setTimeout(() => {
      console.log("🔄 Retrying database connection...")
      connectDB()
    }, 5000)

    // Don't throw error in production to allow app to start
    if (process.env.NODE_ENV === "production") {
      console.log("🚀 Production mode: App starting without DB connection")
      return null
    } else {
      throw error
    }
  }
}

export default connectDB
