"use client"

import { useEffect } from "react"
import Navbar from "../shared/Navbar"
import ApplicantsTable from "./ApplicantsTable"
import axios from "axios"
import { APPLICATION_API_END_POINT } from "@/utils/constant"
import { useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { setAllApplicants } from "@/redux/applicationSlice"
import { ArrowLeft, Users, Briefcase } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button"

const Applicants = () => {
  const params = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { applicants } = useSelector((store) => store.application)

  useEffect(() => {
    const fetchAllApplicants = async () => {
      try {
        const res = await axios.get(`${APPLICATION_API_END_POINT}/${params.id}/applicants`, { withCredentials: true })
        dispatch(setAllApplicants(res.data.job))
      } catch (error) {
        console.log(error)
      }
    }
    fetchAllApplicants()
  }, [params.id, dispatch])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <Button
            onClick={() => navigate("/admin/jobs")}
            variant="outline"
            className="mb-6 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{applicants?.title || "Job Position"}</h1>
                  <p className="text-gray-600 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {applicants?.applications?.length || 0} Total Applications
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Company</p>
                  <p className="font-semibold text-gray-800">{applicants?.company?.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Applicants Table */}
        <ApplicantsTable />
      </div>
    </div>
  )
}

export default Applicants
