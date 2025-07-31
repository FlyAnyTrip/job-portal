import { Job } from "../models/job.model.js"

// admin post krega job
export const postJob = async (req, res) => {
  try {
    const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body
    const userId = req.id

    console.log("Creating job for user:", userId)

    if (
      !title ||
      !description ||
      !requirements ||
      !salary ||
      !location ||
      !jobType ||
      !experience ||
      !position ||
      !companyId
    ) {
      return res.status(400).json({
        message: "Something is missing.",
        success: false,
      })
    }

    // Convert salary to number and handle NaN
    const salaryNumber = Number.parseFloat(salary)
    if (isNaN(salaryNumber)) {
      return res.status(400).json({
        message: "Please enter a valid salary amount.",
        success: false,
      })
    }

    // Convert experience to number
    let experienceNumber
    if (typeof experience === "string") {
      const experienceMatch = experience.match(/\d+/)
      experienceNumber = experienceMatch ? Number.parseInt(experienceMatch[0]) : Number.parseInt(experience)
    } else {
      experienceNumber = Number.parseInt(experience)
    }

    if (isNaN(experienceNumber)) {
      return res.status(400).json({
        message: "Please enter a valid experience level (number only).",
        success: false,
      })
    }

    const job = await Job.create({
      title,
      description,
      requirements: requirements.split(","),
      salary: salaryNumber,
      location,
      jobType,
      experienceLevel: experienceNumber,
      position: Number.parseInt(position),
      company: companyId,
      created_by: userId,
    })

    console.log("Job created successfully:", job._id)

    return res.status(201).json({
      message: "New job created successfully.",
      job,
      success: true,
    })
  } catch (error) {
    console.log("Error creating job:", error)
    return res.status(500).json({
      message: "Internal server error.",
      success: false,
    })
  }
}

// PUBLIC ROUTE - No authentication needed
export const getAllJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword || ""
    const query = {
      $or: [{ title: { $regex: keyword, $options: "i" } }, { description: { $regex: keyword, $options: "i" } }],
    }

    const jobs = await Job.find(query)
      .populate({
        path: "company",
      })
      .sort({ createdAt: -1 })

    return res.status(200).json({
      jobs: jobs || [],
      success: true,
    })
  } catch (error) {
    console.log("Error in getAllJobs:", error)
    return res.status(500).json({
      message: "Error fetching jobs",
      success: false,
      jobs: [],
    })
  }
}

// PUBLIC ROUTE - No authentication needed
export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id
    const job = await Job.findById(jobId).populate({
      path: "applications",
    })

    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
        success: false,
      })
    }

    return res.status(200).json({
      job,
      success: true,
    })
  } catch (error) {
    console.log("Error in getJobById:", error)
    return res.status(500).json({
      message: "Error fetching job details",
      success: false,
    })
  }
}

// PROTECTED ROUTE - Authentication required
export const getAdminJobs = async (req, res) => {
  try {
    const adminId = req.id
    console.log("Fetching admin jobs for user:", adminId)

    const jobs = await Job.find({ created_by: adminId })
      .populate({
        path: "company",
      })
      .sort({ createdAt: -1 })

    console.log("Found", jobs.length, "jobs for admin:", adminId)

    return res.status(200).json({
      jobs: jobs || [],
      success: true,
    })
  } catch (error) {
    console.log("Error in getAdminJobs:", error)
    return res.status(500).json({
      message: "Error fetching admin jobs",
      success: false,
    })
  }
}
