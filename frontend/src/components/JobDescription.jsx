"use client"

import { useEffect, useState } from "react"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { useParams } from "react-router-dom"
import axios from "axios"
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from "@/utils/constant"
import { setSingleJob } from "@/redux/jobSlice"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "sonner"
import { ArrowLeft, MapPin, Clock, DollarSign, Users, Building } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Navbar from "./shared/Navbar"

const JobDescription = () => {
  const { singleJob } = useSelector((store) => store.job)
  const { user } = useSelector((store) => store.auth)
  const isIntiallyApplied = singleJob?.applications?.some((application) => application.applicant === user?._id) || false
  const [isApplied, setIsApplied] = useState(isIntiallyApplied)
  const [loading, setLoading] = useState(false)

  const params = useParams()
  const jobId = params.id
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const applyJobHandler = async () => {
    if (!user) {
      toast.error("Please login to apply for jobs")
      navigate("/login")
      return
    }

    try {
      setLoading(true)
      const res = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`, { withCredentials: true })

      if (res.data.success) {
        setIsApplied(true)
        const updatedSingleJob = { ...singleJob, applications: [...singleJob.applications, { applicant: user?._id }] }
        dispatch(setSingleJob(updatedSingleJob))
        toast.success(res.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || "Failed to apply")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchSingleJob = async () => {
      if (!jobId || jobId === "undefined") {
        toast.error("Invalid job ID")
        navigate("/")
        return
      }

      try {
        const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`)
        if (res.data.success) {
          dispatch(setSingleJob(res.data.job))
          setIsApplied(res.data.job.applications.some((application) => application.applicant === user?._id))
        }
      } catch (error) {
        console.log(error)
        toast.error("Failed to fetch job details")
        navigate("/")
      }
    }

    fetchSingleJob()
  }, [jobId, dispatch, user?._id, navigate])

  if (!singleJob) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse mx-auto mb-4"></div>
            <p className="text-gray-500">Loading job details...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="mb-6 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{singleJob?.title}</h1>
                  <p className="text-lg text-gray-600 mb-4">{singleJob?.company?.name}</p>
                  <div className="flex flex-wrap gap-3">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors duration-200">
                      <Users className="w-3 h-3 mr-1" />
                      {singleJob?.position} Positions
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors duration-200">
                      <DollarSign className="w-3 h-3 mr-1" />₹{singleJob?.salary?.toLocaleString()} LPA
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors duration-200">
                      <Clock className="w-3 h-3 mr-1" />
                      {singleJob?.jobType}
                    </Badge>
                    <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors duration-200">
                      <MapPin className="w-3 h-3 mr-1" />
                      {singleJob?.location}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                onClick={isApplied ? null : applyJobHandler}
                disabled={isApplied || loading}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  isApplied
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                }`}
              >
                {loading ? "Applying..." : isApplied ? "Already Applied" : "Apply Now"}
              </Button>
            </div>
          </div>

          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-3">Job Description</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Role</h3>
                  <p className="text-gray-600">{singleJob?.title}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Location</h3>
                  <p className="text-gray-600">{singleJob?.location}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Experience Required</h3>
                  <p className="text-gray-600">{singleJob?.experienceLevel} years</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Salary</h3>
                  <p className="text-gray-600">₹{singleJob?.salary?.toLocaleString()} LPA</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Total Applicants</h3>
                  <p className="text-gray-600">{singleJob?.applications?.length || 0}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Posted Date</h3>
                  <p className="text-gray-600">
                    {new Date(singleJob?.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Job Type</h3>
                  <p className="text-gray-600">{singleJob?.jobType}</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-semibold text-gray-800 mb-4">Description</h3>
              <p className="text-gray-600 leading-relaxed">{singleJob?.description}</p>
            </div>

            {singleJob?.requirements && singleJob.requirements.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-gray-800 mb-4">Requirements</h3>
                <div className="flex flex-wrap gap-2">
                  {singleJob.requirements.map((req, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      {req.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobDescription
