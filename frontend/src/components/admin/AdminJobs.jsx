"use client"

import { useEffect, useState } from "react"
import Navbar from "../shared/Navbar"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import AdminJobsTable from "./AdminJobsTable"
import useGetAllAdminJobs from "@/hooks/useGetAllAdminJobs"
import { setSearchJobByText } from "@/redux/jobSlice"
import { Briefcase, Plus, Search } from "lucide-react"

const AdminJobs = () => {
  useGetAllAdminJobs()
  const [input, setInput] = useState("")
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((store) => store.auth)
  const { allAdminJobs } = useSelector((store) => store.job)

  console.log("AdminJobs component - allAdminJobs:", allAdminJobs)
  console.log("AdminJobs component - user:", user)

  useEffect(() => {
    dispatch(setSearchJobByText(input))
  }, [input, dispatch])

  // Redirect if not recruiter
  useEffect(() => {
    if (user && user.role !== "recruiter") {
      navigate("/")
    }
  }, [user, navigate])

  if (!user || user.role !== "recruiter") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600">You need to be logged in as a recruiter to access this page.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Jobs</h1>
              <p className="text-gray-600">
                You have posted {allAdminJobs?.length || 0} job{allAdminJobs?.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Button
              onClick={() => navigate("/admin/jobs/create")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Job
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                className="pl-10"
                placeholder="Filter by job title or company name..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
          </div>
        </div>

        <AdminJobsTable />
      </div>
    </div>
  )
}

export default AdminJobs
