import mongoose from "mongoose"

const connectDB = async () => {
  try {
    // Connection options for better reliability
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // Disable mongoose buffering
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, options)

    console.log("✅ MongoDB connected successfully")
    console.log(`📍 Host: ${conn.connection.host}`)
    console.log(`🗄️  Database: ${conn.connection.name}`)
    console.log(`🔗 Connection State: ${conn.connection.readyState}`)

    // Connection event listeners
    mongoose.connection.on("connected", () => {
      console.log("🟢 Mongoose connected to MongoDB")
    })

    mongoose.connection.on("error", (err) => {
      console.error("❌ Mongoose connection error:", err)
    })

    mongoose.connection.on("disconnected", () => {
      console.log("🔴 Mongoose disconnected from MongoDB")
    })

    // Handle application termination
    process.on("SIGINT", async () => {
      await mongoose.connection.close()
      console.log("🔴 Mongoose connection closed due to application termination")
      process.exit(0)
    })

    return conn
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message)
    console.error("🔍 Error details:", error)

    // Don't exit the process, let the app handle the error
    throw error
  }
}

export default connectDB
