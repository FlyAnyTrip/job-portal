// import React from 'react'
// import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
// import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
// import { MoreHorizontal } from 'lucide-react';
// import { useSelector } from 'react-redux';
// import { toast } from 'sonner';
// import { APPLICATION_API_END_POINT } from '@/utils/constant';
// import axios from 'axios';

// const shortlistingStatus = ["Accepted", "Rejected"];

// const ApplicantsTable = () => {
//     const { applicants } = useSelector(store => store.application);

//     const statusHandler = async (status, id) => {
//         console.log('called');
//         try {
//             axios.defaults.withCredentials = true;
//             const res = await axios.post(`${APPLICATION_API_END_POINT}/status/${id}/update`, { status });
//             console.log(res);
//             if (res.data.success) {
//                 toast.success(res.data.message);
//             }
//         } catch (error) {
//             toast.error(error.response.data.message);
//         }
//     }

//     return (
//         <div>
//             <Table>
//                 <TableCaption>A list of your recent applied user</TableCaption>
//                 <TableHeader>
//                     <TableRow>
//                         <TableHead>FullName</TableHead>
//                         <TableHead>Email</TableHead>
//                         <TableHead>Contact</TableHead>
//                         <TableHead>Resume</TableHead>
//                         <TableHead>Date</TableHead>
//                         <TableHead className="text-right">Action</TableHead>
//                     </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                     {
//                         applicants && applicants?.applications?.map((item) => (
//                             <tr key={item._id}>
//                                 <TableCell>{item?.applicant?.fullname}</TableCell>
//                                 <TableCell>{item?.applicant?.email}</TableCell>
//                                 <TableCell>{item?.applicant?.phoneNumber}</TableCell>
//                                 <TableCell >
//                                     {
//                                         item.applicant?.profile?.resume ? <a className="text-blue-600 cursor-pointer" href={item?.applicant?.profile?.resume} target="_blank" rel="noopener noreferrer">{item?.applicant?.profile?.resumeOriginalName}</a> : <span>NA</span>
//                                     }
//                                 </TableCell>
//                                 <TableCell>{item?.applicant.createdAt.split("T")[0]}</TableCell>
//                                 <TableCell className="float-right cursor-pointer">
//                                     <Popover>
//                                         <PopoverTrigger>
//                                             <MoreHorizontal />
//                                         </PopoverTrigger>
//                                         <PopoverContent className="w-32">
//                                             {
//                                                 shortlistingStatus.map((status, index) => {
//                                                     return (
//                                                         <div onClick={() => statusHandler(status, item?._id)} key={index} className='flex w-fit items-center my-2 cursor-pointer'>
//                                                             <span>{status}</span>
//                                                         </div>
//                                                     )
//                                                 })
//                                             }
//                                         </PopoverContent>
//                                     </Popover>

//                                 </TableCell>

//                             </tr>
//                         ))
//                     }

//                 </TableBody>

//             </Table>
//         </div>
//     )
// }

// export default ApplicantsTable


//  test 

"use client"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { MoreHorizontal, CheckCircle, XCircle, Clock, Eye } from "lucide-react"
import { useSelector } from "react-redux"
import { toast } from "sonner"
import { APPLICATION_API_END_POINT } from "@/utils/constant"
import axios from "axios"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"

const ApplicantsTable = () => {
  const { applicants } = useSelector((store) => store.application)

  const statusHandler = async (status, id) => {
    try {
      axios.defaults.withCredentials = true
      const res = await axios.post(`${APPLICATION_API_END_POINT}/status/${id}/update`, { status })
      if (res.data.success) {
        toast.success(res.data.message)
        // Refresh the page to show updated status
        window.location.reload()
      }
    } catch (error) {
      toast.error(error.response.data.message)
    }
  }

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors duration-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Accepted
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 transition-colors duration-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors duration-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
    }
  }

  const handleResumeView = (resumeUrl) => {
    if (resumeUrl) {
      // Try direct view first
      try {
        window.open(resumeUrl, "_blank", "noopener,noreferrer")
        toast.success("Opening resume...")
      } catch (error) {
        // Fallback to PDF.js viewer
        const pdfJsUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(resumeUrl)}`
        window.open(pdfJsUrl, "_blank", "noopener,noreferrer")
        toast.success("Opening resume with PDF viewer...")
      }
    } else {
      toast.error("Resume not available")
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Job Applicants</h2>
        <p className="text-gray-600 mt-1">Manage and review job applications</p>
      </div>

      <Table>
        <TableCaption className="text-gray-500 py-4">A list of recent applicants for this position</TableCaption>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
            <TableHead className="font-semibold text-gray-700">Full Name</TableHead>
            <TableHead className="font-semibold text-gray-700">Email</TableHead>
            <TableHead className="font-semibold text-gray-700">Contact</TableHead>
            <TableHead className="font-semibold text-gray-700">Resume</TableHead>
            <TableHead className="font-semibold text-gray-700">Status</TableHead>
            <TableHead className="font-semibold text-gray-700">Applied Date</TableHead>
            <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applicants && applicants?.applications?.length > 0 ? (
            applicants?.applications?.map((item) => (
              <TableRow
                key={item._id}
                className="hover:bg-blue-50 transition-all duration-200 border-b border-gray-100"
              >
                <TableCell className="font-medium text-gray-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {item?.applicant?.fullname?.charAt(0).toUpperCase()}
                    </div>
                    <span>{item?.applicant?.fullname}</span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">{item?.applicant?.email}</TableCell>
                <TableCell className="text-gray-600">{item?.applicant?.phoneNumber}</TableCell>
                <TableCell>
                  {item.applicant?.profile?.resume ? (
                    <Button
                      onClick={() => handleResumeView(item.applicant.profile.resume)}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Resume
                    </Button>
                  ) : (
                    <span className="text-gray-400 text-sm">No Resume</span>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(item?.status)}</TableCell>
                <TableCell className="text-gray-600">
                  {new Date(item?.applicant?.createdAt).toLocaleDateString("en-IN")}
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
                          onClick={() => statusHandler("accepted", item?._id)}
                          className="w-full flex items-center px-3 py-2 text-sm text-green-700 hover:bg-green-50 rounded-md transition-colors duration-200"
                          disabled={item?.status === "accepted"}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept Application
                        </button>
                        <button
                          onClick={() => statusHandler("rejected", item?._id)}
                          className="w-full flex items-center px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
                          disabled={item?.status === "rejected"}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject Application
                        </button>
                        <button
                          onClick={() => statusHandler("pending", item?._id)}
                          className="w-full flex items-center px-3 py-2 text-sm text-yellow-700 hover:bg-yellow-50 rounded-md transition-colors duration-200"
                          disabled={item?.status === "pending"}
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Mark as Pending
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No applications yet</p>
                  <p className="text-gray-400 text-sm">Applications will appear here once candidates apply</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default ApplicantsTable
