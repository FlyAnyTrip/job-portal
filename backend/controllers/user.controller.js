import { User } from "../models/user.model.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import getDataUri from "../utils/datauri.js"
import cloudinary, { makeResourcePublic, checkResourceAccess } from "../utils/cloudinary.js"

export const register = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password, role } = req.body

    console.log("Registration attempt:", { fullname, email, role })

    if (!fullname || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({
        message: "Something is missing",
        success: false,
      })
    }

    const file = req.file
    let profilePhotoUrl = ""

    // Handle file upload if file is provided
    if (file) {
      console.log("File received:", {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      })

      try {
        const fileUri = getDataUri(file)
        if (fileUri) {
          console.log("Uploading to Cloudinary...")
          const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
            folder: "job-portal/profiles",
            resource_type: "auto",
            access_mode: "public",
            type: "upload",
            transformation: [{ width: 500, height: 500, crop: "limit" }, { quality: "auto" }],
          })
          profilePhotoUrl = cloudResponse.secure_url
          console.log("✅ Profile photo uploaded successfully:", profilePhotoUrl)
        }
      } catch (uploadError) {
        console.error("❌ Cloudinary upload failed:", uploadError.message)
        console.log("Continuing registration without profile photo...")
      }
    }

    const user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({
        message: "User already exist with this email.",
        success: false,
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await User.create({
      fullname,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
      profile: {
        profilePhoto: profilePhotoUrl,
      },
    })

    return res.status(201).json({
      message: "Account created successfully.",
      success: true,
    })
  } catch (error) {
    console.error("Register error:", error)
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body

    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Something is missing",
        success: false,
      })
    }

    let user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({
        message: "Incorrect email or password.",
        success: false,
      })
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Incorrect email or password.",
        success: false,
      })
    }

    // check role is correct or not
    if (role !== user.role) {
      return res.status(400).json({
        message: "Account doesn't exist with current role.",
        success: false,
      })
    }

    const tokenData = {
      userId: user._id,
    }
    const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: "1d" })

    user = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    }

    return res
      .status(200)
      .cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpsOnly: true, sameSite: "strict" })
      .json({
        message: `Welcome back ${user.fullname}`,
        user,
        success: true,
      })
  } catch (error) {
    console.error("Login error:", error)
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    })
  }
}

export const logout = async (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out successfully.",
      success: true,
    })
  } catch (error) {
    console.error("Logout error:", error)
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, bio, skills } = req.body

    console.log("Profile update request:", { fullname, email, phoneNumber, bio, skills })

    const file = req.file
    let cloudResponse = null

    // Handle file upload if file is provided
    if (file) {
      console.log("File received for profile update:", {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      })

      try {
        const fileUri = getDataUri(file)
        if (fileUri) {
          console.log("Uploading to Cloudinary...")

          // BULLETPROOF PDF upload configuration
          let uploadOptions = {}

          if (file.mimetype === "application/pdf") {
            // Generate unique public ID
            const publicId = `resume_${Date.now()}_${Math.random().toString(36).substring(7)}`

            uploadOptions = {
              folder: "job-portal/resumes",
              resource_type: "raw", // Use raw for PDFs
              public_id: publicId,
              // CRITICAL: Complete public access
              access_mode: "public",
              type: "upload",
              // Remove all restrictions
              sign_url: false,
              invalidate: true,
              // Add proper context
              context: {
                alt: "Resume PDF",
                caption: file.originalname,
              },
              // Ensure proper delivery
              delivery_type: "upload",
              // Add tags for management
              tags: ["resume", "pdf", "public"],
            }
          } else if (file.mimetype.startsWith("image/")) {
            uploadOptions = {
              folder: "job-portal/profiles",
              resource_type: "image",
              access_mode: "public",
              type: "upload",
              transformation: [{ width: 500, height: 500, crop: "limit" }, { quality: "auto" }],
            }
          } else {
            uploadOptions = {
              folder: "job-portal/documents",
              resource_type: "raw",
              access_mode: "public",
              type: "upload",
            }
          }

          cloudResponse = await cloudinary.uploader.upload(fileUri.content, uploadOptions)

          // Log detailed response for debugging
          console.log("✅ File uploaded successfully:")
          console.log("- URL:", cloudResponse.secure_url)
          console.log("- Public ID:", cloudResponse.public_id)
          console.log("- Resource Type:", cloudResponse.resource_type)
          console.log("- Access Mode:", cloudResponse.access_mode)
          console.log("- Type:", cloudResponse.type)

          // Double-check PDF accessibility
          if (file.mimetype === "application/pdf") {
            console.log("🔍 Verifying PDF accessibility...")

            // Wait a moment for Cloudinary to process
            await new Promise((resolve) => setTimeout(resolve, 2000))

            const accessCheck = await checkResourceAccess(cloudResponse.public_id, "raw")

            if (!accessCheck.isPublic) {
              console.log("⚠️ PDF not public, attempting to fix...")
              const fixedUrl = await makeResourcePublic(cloudResponse.public_id, "raw")
              if (fixedUrl) {
                cloudResponse.secure_url = fixedUrl
                console.log("✅ PDF access fixed:", fixedUrl)
              }
            } else {
              console.log("✅ PDF is properly accessible")
            }
          }
        }
      } catch (uploadError) {
        console.error("❌ Cloudinary upload failed:", uploadError.message)
        console.error("Upload error details:", uploadError)
        return res.status(500).json({
          message: "File upload failed. Please try again.",
          success: false,
        })
      }
    }

    let skillsArray
    if (skills) {
      skillsArray = skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0)
    }

    const userId = req.id // middleware authentication
    let user = await User.findById(userId)

    if (!user) {
      return res.status(400).json({
        message: "User not found.",
        success: false,
      })
    }

    // updating data
    if (fullname) user.fullname = fullname
    if (email) user.email = email
    if (phoneNumber) user.phoneNumber = phoneNumber
    if (bio) user.profile.bio = bio
    if (skillsArray) user.profile.skills = skillsArray

    // Handle file upload result
    if (cloudResponse) {
      if (file.mimetype === "application/pdf") {
        user.profile.resume = cloudResponse.secure_url
        user.profile.resumeOriginalName = file.originalname
        console.log("✅ Resume updated successfully")
      } else if (file.mimetype.startsWith("image/")) {
        user.profile.profilePhoto = cloudResponse.secure_url
        console.log("✅ Profile photo updated successfully")
      }
    }

    await user.save()

    user = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    }

    return res.status(200).json({
      message: "Profile updated successfully.",
      user,
      success: true,
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    })
  }
}

// NEW: Fix existing PDF access
export const fixPDFAccess = async (req, res) => {
  try {
    const userId = req.id
    const user = await User.findById(userId)

    if (!user || !user.profile.resume) {
      return res.status(400).json({
        message: "No resume found to fix",
        success: false,
      })
    }

    console.log("🔧 Fixing PDF access for user:", userId)
    console.log("Current resume URL:", user.profile.resume)

    // Extract public ID from URL
    const urlParts = user.profile.resume.split("/")
    const fileNameWithExt = urlParts[urlParts.length - 1]
    const fileName = fileNameWithExt.split(".")[0]
    const publicId = `job-portal/resumes/${fileName}`

    console.log("Extracted public ID:", publicId)

    // Try to make it public
    const fixedUrl = await makeResourcePublic(publicId, "raw")

    if (fixedUrl) {
      // Update user's resume URL
      user.profile.resume = fixedUrl
      await user.save()

      console.log("✅ PDF access fixed successfully")

      return res.status(200).json({
        message: "PDF access fixed successfully",
        newUrl: fixedUrl,
        success: true,
      })
    } else {
      return res.status(500).json({
        message: "Failed to fix PDF access. Please re-upload your resume.",
        success: false,
      })
    }
  } catch (error) {
    console.error("Fix PDF access error:", error)
    return res.status(500).json({
      message: "Failed to fix PDF access",
      success: false,
    })
  }
}

// Enhanced PDF Proxy Route
export const getPDFProxy = async (req, res) => {
  try {
    const { url } = req.query

    if (!url) {
      return res.status(400).json({
        message: "PDF URL is required",
        success: false,
      })
    }

    console.log("PDF Proxy request for:", url)

    // Set comprehensive headers for PDF viewing
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
    res.setHeader("Cache-Control", "public, max-age=3600")
    res.setHeader("X-Content-Type-Options", "nosniff")

    // Handle OPTIONS request
    if (req.method === "OPTIONS") {
      return res.status(200).end()
    }

    // Redirect to the PDF URL
    res.redirect(url)
  } catch (error) {
    console.error("PDF proxy error:", error)
    return res.status(500).json({
      message: "Failed to load PDF",
      success: false,
    })
  }
}

// Direct PDF serve route with better error handling
export const servePDF = async (req, res) => {
  try {
    const { publicId } = req.params

    if (!publicId) {
      return res.status(400).json({
        message: "PDF ID is required",
        success: false,
      })
    }

    // Check if resource exists and is accessible
    const accessCheck = await checkResourceAccess(publicId, "raw")

    if (!accessCheck.exists) {
      return res.status(404).json({
        message: "PDF not found",
        success: false,
      })
    }

    if (!accessCheck.isPublic) {
      console.log("PDF not public, attempting to fix...")
      const fixedUrl = await makeResourcePublic(publicId, "raw")
      if (fixedUrl) {
        accessCheck.url = fixedUrl
      }
    }

    console.log("Serving PDF:", accessCheck.url)

    // Set proper headers
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Cache-Control", "public, max-age=3600")

    // Redirect to PDF
    res.redirect(accessCheck.url)
  } catch (error) {
    console.error("Serve PDF error:", error)
    return res.status(500).json({
      message: "Failed to serve PDF",
      success: false,
    })
  }
}
