"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Edit2, Eye, MoreHorizontal, Briefcase } from "lucide-react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

const AdminJobsTable = () => {
  const { allAdminJobs, searchJobByText } = useSelector((store) => store.job)
  const [filterJobs, setFilterJobs] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    console.log("AdminJobsTable - allAdminJobs:", allAdminJobs)
    console.log("AdminJobsTable - searchJobByText:", searchJobByText)

    if (!allAdminJobs || allAdminJobs.length === 0) {
      setFilterJobs([])
      return
    }

    const filteredJobs = allAdminJobs.filter((job) => {
      if (!searchJobByText) {
        return true
      }
      return (
        job?.title?.toLowerCase().includes(searchJobByText.toLowerCase()) ||
        job?.company?.name?.toLowerCase().includes(searchJobByText.toLowerCase())
      )
    })

    console.log("Filtered jobs:", filteredJobs)
    setFilterJobs(filteredJobs)
  }, [allAdminJobs, searchJobByText])

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Your Posted Jobs</h2>
        <p className="text-gray-600 mt-1">Manage and track your job postings</p>
      </div>

      <Table>
        <TableCaption className="text-gray-500 py-4">A list of your recent posted jobs</TableCaption>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
            <TableHead className="font-semibold text-gray-700">Company Name</TableHead>
            <TableHead className="font-semibold text-gray-700">Job Title</TableHead>
            <TableHead className="font-semibold text-gray-700">Location</TableHead>
            <TableHead className="font-semibold text-gray-700">Salary</TableHead>
            <TableHead className="font-semibold text-gray-700">Posted Date</TableHead>
            <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!allAdminJobs || allAdminJobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No jobs posted yet</p>
                  <p className="text-gray-400 text-sm">Create your first job posting to get started</p>
                </div>
              </TableCell>
            </TableRow>
          ) : filterJobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No jobs match your search</p>
                  <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filterJobs.map((job) => (
              <TableRow key={job._id} className="hover:bg-blue-50 transition-all duration-200 border-b border-gray-100">
                <TableCell className="font-medium text-gray-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {job?.company?.name?.charAt(0).toUpperCase() || "C"}
                    </div>
                    <span>{job?.company?.name || "Company Name"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-gray-800">{job?.title}</div>
                  <div className="text-sm text-gray-500">{job?.jobType}</div>
                </TableCell>
                <TableCell className="text-gray-600">{job?.location}</TableCell>
                <TableCell className="text-gray-600">₹{job?.salary?.toLocaleString()} LPA</TableCell>
                <TableCell className="text-gray-600">
                  {new Date(job?.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
                        <MoreHorizontal className="w-4 h-4 text-gray-600" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2 bg-white shadow-xl border border-gray-200 rounded-lg">
                      <div className="space-y-1">
                        <button
                          onClick={() => navigate(`/admin/jobs/${job._id}/edit`)}
                          className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit Job
                        </button>
                        <button
                          onClick={() => navigate(`/admin/jobs/${job._id}/applicants`)}
                          className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Applicants ({job?.applications?.length || 0})
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default AdminJobsTable
