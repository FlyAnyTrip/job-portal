import { v2 as cloudinary } from "cloudinary"
import dotenv from "dotenv"
dotenv.config()

// Enhanced Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
  sign_url: false,
  use_filename: true,
  unique_filename: false,
})

// Test cloudinary connection
const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping()
    console.log("✅ Cloudinary connected successfully:", result)
    return true
  } catch (error) {
    console.error("❌ Cloudinary connection failed:", error.message)
    return false
  }
}

// Helper function to make existing PDFs public
export const makeResourcePublic = async (publicId, resourceType = "raw") => {
  try {
    console.log(`🔧 Making resource public: ${publicId}`)

    const result = await cloudinary.api.update(publicId, {
      resource_type: resourceType,
      access_mode: "public",
      type: "upload",
    })

    console.log("✅ Resource made public:", result.secure_url)
    return result.secure_url
  } catch (error) {
    console.error("❌ Failed to make resource public:", error.message)
    return null
  }
}

// Helper function to generate public URL with fallback
export const getPublicUrl = (publicId, resourceType = "raw") => {
  try {
    const url = cloudinary.url(publicId, {
      resource_type: resourceType,
      secure: true,
      sign_url: false,
      type: "upload",
      access_mode: "public",
    })
    console.log("Generated public URL:", url)
    return url
  } catch (error) {
    console.error("Error generating public URL:", error)
    return null
  }
}

// Helper function to check if resource exists and is accessible
export const checkResourceAccess = async (publicId, resourceType = "raw") => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: resourceType,
    })

    console.log("Resource access check:", {
      public_id: result.public_id,
      access_mode: result.access_mode,
      secure_url: result.secure_url,
    })

    return {
      exists: true,
      isPublic: result.access_mode === "public",
      url: result.secure_url,
    }
  } catch (error) {
    console.error("Resource access check failed:", error.message)
    return {
      exists: false,
      isPublic: false,
      url: null,
    }
  }
}

// Call test function
testCloudinaryConnection()

export default cloudinary
