// Test MongoDB connection script
import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

async function testConnection() {
  try {
    console.log("🧪 Testing MongoDB Connection...")

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found in environment")
    }

    console.log("✅ MONGO_URI found")
    console.log("🔗 Connecting to:", process.env.MONGO_URI.substring(0, 30) + "...")

    // Simple connection
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    })

    console.log("✅ Connected successfully!")
    console.log("📍 Host:", mongoose.connection.host)
    console.log("🗄️ Database:", mongoose.connection.name)

    // Test ping
    await mongoose.connection.db.admin().ping()
    console.log("✅ Ping successful!")

    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log(
      "📚 Collections:",
      collections.map((c) => c.name),
    )

    console.log("🎉 All tests passed!")
  } catch (error) {
    console.error("❌ Connection test failed:")
    console.error("Error:", error.message)
    console.error("Code:", error.code)
    console.error("CodeName:", error.codeName)
  } finally {
    await mongoose.connection.close()
    console.log("🔄 Connection closed")
    process.exit(0)
  }
}

testConnection()
