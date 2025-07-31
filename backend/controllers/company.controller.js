// import { Company } from "../models/company.model.js"
// import getDataUri from "../utils/datauri.js"
// import cloudinary from "../utils/cloudinary.js"

// export const registerCompany = async (req, res) => {
//   try {
//     const { companyName } = req.body
//     if (!companyName) {
//       return res.status(400).json({
//         message: "Company name is required.",
//         success: false,
//       })
//     }

//     let company = await Company.findOne({ name: companyName })
//     if (company) {
//       return res.status(400).json({
//         message: "You can't register same company.",
//         success: false,
//       })
//     }

//     company = await Company.create({
//       name: companyName,
//       userId: req.id,
//     })

//     return res.status(201).json({
//       message: "Company registered successfully.",
//       company,
//       success: true,
//     })
//   } catch (error) {
//     console.log("Register company error:", error)
//     return res.status(500).json({
//       message: "Internal server error",
//       success: false,
//     })
//   }
// }

// export const getCompany = async (req, res) => {
//   try {
//     const userId = req.id // logged in user id
//     const companies = await Company.find({ userId })

//     return res.status(200).json({
//       companies: companies || [],
//       success: true,
//     })
//   } catch (error) {
//     console.log("Get company error:", error)
//     return res.status(500).json({
//       message: "Internal server error",
//       success: false,
//     })
//   }
// }

// // get company by id
// export const getCompanyById = async (req, res) => {
//   try {
//     const companyId = req.params.id
//     const company = await Company.findById(companyId)
//     if (!company) {
//       return res.status(404).json({
//         message: "Company not found.",
//         success: false,
//       })
//     }
//     return res.status(200).json({
//       company,
//       success: true,
//     })
//   } catch (error) {
//     console.log("Get company by id error:", error)
//     return res.status(500).json({
//       message: "Internal server error",
//       success: false,
//     })
//   }
// }

// export const updateCompany = async (req, res) => {
//   try {
//     const { name, description, website, location } = req.body

//     const file = req.file
//     let logo = ""

//     // Handle file upload if file is provided
//     if (file) {
//       const fileUri = getDataUri(file)
//       if (fileUri) {
//         const cloudResponse = await cloudinary.uploader.upload(fileUri.content)
//         logo = cloudResponse.secure_url
//       }
//     }

//     const updateData = { name, description, website, location }
//     if (logo) {
//       updateData.logo = logo
//     }

//     const company = await Company.findByIdAndUpdate(req.params.id, updateData, { new: true })

//     if (!company) {
//       return res.status(404).json({
//         message: "Company not found.",
//         success: false,
//       })
//     }

//     return res.status(200).json({
//       message: "Company information updated.",
//       success: true,
//     })
//   } catch (error) {
//     console.log("Update company error:", error)
//     return res.status(500).json({
//       message: "Internal server error",
//       success: false,
//     })
//   }
// }


//  test 

import { Company } from "../models/company.model.js"
import getDataUri from "../utils/datauri.js"
import cloudinary from "../utils/cloudinary.js"

export const registerCompany = async (req, res) => {
  try {
    const { companyName } = req.body
    if (!companyName) {
      return res.status(400).json({
        message: "Company name is required.",
        success: false,
      })
    }

    let company = await Company.findOne({ name: companyName })
    if (company) {
      return res.status(400).json({
        message: "You can't register same company.",
        success: false,
      })
    }

    company = await Company.create({
      name: companyName,
      userId: req.id,
    })

    return res.status(201).json({
      message: "Company registered successfully.",
      company,
      success: true,
    })
  } catch (error) {
    console.error("Register company error:", error)
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    })
  }
}

export const getCompany = async (req, res) => {
  try {
    const userId = req.id // logged in user id
    const companies = await Company.find({ userId })

    return res.status(200).json({
      companies: companies || [],
      success: true,
    })
  } catch (error) {
    console.error("Get company error:", error)
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    })
  }
}

// get company by id
export const getCompanyById = async (req, res) => {
  try {
    const companyId = req.params.id
    const company = await Company.findById(companyId)
    if (!company) {
      return res.status(404).json({
        message: "Company not found.",
        success: false,
      })
    }
    return res.status(200).json({
      company,
      success: true,
    })
  } catch (error) {
    console.error("Get company by id error:", error)
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    })
  }
}

export const updateCompany = async (req, res) => {
  try {
    const { name, description, website, location } = req.body

    console.log("Company update request:", { name, description, website, location })

    const file = req.file
    let logo = ""

    // Handle file upload if file is provided
    if (file) {
      console.log("Company logo file received:", {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      })

      try {
        const fileUri = getDataUri(file)
        if (fileUri) {
          console.log("Uploading company logo to Cloudinary...")
          const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
            folder: "job-portal/company-logos",
            resource_type: "image",
            transformation: [{ width: 300, height: 300, crop: "limit" }, { quality: "auto" }],
          })
          logo = cloudResponse.secure_url
          console.log("✅ Company logo uploaded successfully:", logo)
        }
      } catch (uploadError) {
        console.error("❌ Company logo upload failed:", uploadError.message)
        return res.status(500).json({
          message: "Logo upload failed. Please try again.",
          success: false,
        })
      }
    }

    const updateData = { name, description, website, location }
    if (logo) {
      updateData.logo = logo
    }

    const company = await Company.findByIdAndUpdate(req.params.id, updateData, { new: true })

    if (!company) {
      return res.status(404).json({
        message: "Company not found.",
        success: false,
      })
    }

    return res.status(200).json({
      message: "Company information updated.",
      success: true,
    })
  } catch (error) {
    console.error("Update company error:", error)
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    })
  }
}
