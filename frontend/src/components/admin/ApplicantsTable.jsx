// "use client"
// import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
// import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
// import { MoreHorizontal, CheckCircle, XCircle, Clock, Eye } from "lucide-react"
// import { useSelector } from "react-redux"
// import { toast } from "sonner"
// import { APPLICATION_API_END_POINT } from "@/utils/constant"
// import axios from "axios"
// import { Badge } from "../ui/badge"
// import { Button } from "../ui/button"
// import PDFViewer from "../PDFViewer"
// import { useState } from "react"

// const ApplicantsTable = () => {
//   const { applicants } = useSelector((store) => store.application)
//   const [selectedResume, setSelectedResume] = useState(null)

//   const statusHandler = async (status, id) => {
//     try {
//       axios.defaults.withCredentials = true
//       const res = await axios.post(`${APPLICATION_API_END_POINT}/status/${id}/update`, { status })
//       if (res.data.success) {
//         toast.success(res.data.message)
//         window.location.reload()
//       }
//     } catch (error) {
//       toast.error(error.response.data.message)
//     }
//   }

//   const getStatusBadge = (status) => {
//     switch (status.toLowerCase()) {
//       case "accepted":
//         return (
//           <Badge className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors duration-200">
//             <CheckCircle className="w-3 h-3 mr-1" />
//             Accepted
//           </Badge>
//         )
//       case "rejected":
//         return (
//           <Badge className="bg-red-100 text-red-800 hover:bg-red-200 transition-colors duration-200">
//             <XCircle className="w-3 h-3 mr-1" />
//             Rejected
//           </Badge>
//         )
//       default:
//         return (
//           <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors duration-200">
//             <Clock className="w-3 h-3 mr-1" />
//             Pending
//           </Badge>
//         )
//     }
//   }

//   // 🚀 NEW: Handle resume viewing with popup-free PDF viewer
//   const handleResumeView = (applicant) => {
//     if (applicant?.profile?.resume) {
//       setSelectedResume({
//         url: applicant.profile.resume,
//         fileName: applicant.profile.resumeOriginalName || `${applicant.fullname}_Resume.pdf`,
//         applicantName: applicant.fullname,
//       })
//     } else {
//       toast.error("Resume not available")
//     }
//   }

//   return (
//     <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
//       <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
//         <h2 className="text-xl font-bold text-gray-800">Job Applicants</h2>
//         <p className="text-gray-600 mt-1">Manage and review job applications</p>
//       </div>

//       <Table>
//         <TableCaption className="text-gray-500 py-4">A list of recent applicants for this position</TableCaption>
//         <TableHeader>
//           <TableRow className="bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
//             <TableHead className="font-semibold text-gray-700">Full Name</TableHead>
//             <TableHead className="font-semibold text-gray-700">Email</TableHead>
//             <TableHead className="font-semibold text-gray-700">Contact</TableHead>
//             <TableHead className="font-semibold text-gray-700">Resume</TableHead>
//             <TableHead className="font-semibold text-gray-700">Status</TableHead>
//             <TableHead className="font-semibold text-gray-700">Applied Date</TableHead>
//             <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {applicants && applicants?.applications?.length > 0 ? (
//             applicants?.applications?.map((item) => (
//               <TableRow
//                 key={item._id}
//                 className="hover:bg-blue-50 transition-all duration-200 border-b border-gray-100"
//               >
//                 <TableCell className="font-medium text-gray-800">
//                   <div className="flex items-center space-x-3">
//                     <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
//                       {item?.applicant?.fullname?.charAt(0).toUpperCase()}
//                     </div>
//                     <span>{item?.applicant?.fullname}</span>
//                   </div>
//                 </TableCell>
//                 <TableCell className="text-gray-600">{item?.applicant?.email}</TableCell>
//                 <TableCell className="text-gray-600">{item?.applicant?.phoneNumber}</TableCell>
//                 <TableCell>
//                   {item.applicant?.profile?.resume ? (
//                     <Button
//                       onClick={() => handleResumeView(item.applicant)}
//                       variant="outline"
//                       size="sm"
//                       className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
//                     >
//                       <Eye className="w-3 h-3 mr-1" />
//                       View Resume
//                     </Button>
//                   ) : (
//                     <span className="text-gray-400 text-sm">No Resume</span>
//                   )}
//                 </TableCell>
//                 <TableCell>{getStatusBadge(item?.status)}</TableCell>
//                 <TableCell className="text-gray-600">
//                   {new Date(item?.applicant?.createdAt).toLocaleDateString("en-IN")}
//                 </TableCell>
//                 <TableCell className="text-right">
//                   <Popover>
//                     <PopoverTrigger asChild>
//                       <button className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
//                         <MoreHorizontal className="w-4 h-4 text-gray-600" />
//                       </button>
//                     </PopoverTrigger>
//                     <PopoverContent className="w-48 p-2 bg-white shadow-xl border border-gray-200 rounded-lg">
//                       <div className="space-y-1">
//                         <button
//                           onClick={() => statusHandler("accepted", item?._id)}
//                           className="w-full flex items-center px-3 py-2 text-sm text-green-700 hover:bg-green-50 rounded-md transition-colors duration-200"
//                           disabled={item?.status === "accepted"}
//                         >
//                           <CheckCircle className="w-4 h-4 mr-2" />
//                           Accept Application
//                         </button>
//                         <button
//                           onClick={() => statusHandler("rejected", item?._id)}
//                           className="w-full flex items-center px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
//                           disabled={item?.status === "rejected"}
//                         >
//                           <XCircle className="w-4 h-4 mr-2" />
//                           Reject Application
//                         </button>
//                         <button
//                           onClick={() => statusHandler("pending", item?._id)}
//                           className="w-full flex items-center px-3 py-2 text-sm text-yellow-700 hover:bg-yellow-50 rounded-md transition-colors duration-200"
//                           disabled={item?.status === "pending"}
//                         >
//                           <Clock className="w-4 h-4 mr-2" />
//                           Mark as Pending
//                         </button>
//                       </div>
//                     </PopoverContent>
//                   </Popover>
//                 </TableCell>
//               </TableRow>
//             ))
//           ) : (
//             <TableRow>
//               <TableCell colSpan={7} className="text-center py-12">
//                 <div className="flex flex-col items-center space-y-3">
//                   <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
//                     <Clock className="w-8 h-8 text-gray-400" />
//                   </div>
//                   <p className="text-gray-500 font-medium">No applications yet</p>
//                   <p className="text-gray-400 text-sm">Applications will appear here once candidates apply</p>
//                 </div>
//               </TableCell>
//             </TableRow>
//           )}
//         </TableBody>
//       </Table>

//       {/* 🚀 POPUP-FREE RESUME VIEWER MODAL */}
//       {selectedResume && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-xl w-full h-full max-w-4xl max-h-[90vh] flex flex-col">
//             {/* Header */}
//             <div className="flex items-center justify-between p-6 border-b border-gray-200">
//               <div>
//                 <h3 className="text-xl font-bold text-gray-800">Resume Viewer</h3>
//                 <p className="text-gray-600">{selectedResume.applicantName}</p>
//               </div>
//               <Button
//                 onClick={() => setSelectedResume(null)}
//                 variant="outline"
//                 size="sm"
//                 className="text-gray-600 hover:bg-gray-50"
//               >
//                 ✕ Close
//               </Button>
//             </div>

//             {/* PDF Viewer */}
//             <div className="flex-1 p-6 overflow-auto">
//               <PDFViewer pdfUrl={selectedResume.url} fileName={selectedResume.fileName} />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
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
import PDFViewer from "../PDFViewer"
import { useState } from "react"

const ApplicantsTable = () => {
  const { applicants } = useSelector((store) => store.application)
  const [selectedResume, setSelectedResume] = useState(null)

  const statusHandler = async (status, id) => {
    try {
      axios.defaults.withCredentials = true
      const res = await axios.post(`${APPLICATION_API_END_POINT}/status/${id}/update`, { status })
      if (res.data.success) {
        toast.success(res.data.message)
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

  // 🚀 ADMIN RESUME VIEWER - Same PDF.js experience
  const handleResumeView = (applicant) => {
    if (applicant?.profile?.resume) {
      setSelectedResume({
        url: applicant.profile.resume,
        fileName: applicant.profile.resumeOriginalName || `${applicant.fullname}_Resume.pdf`,
        applicantName: applicant.fullname,
      })
      toast.success("Opening resume viewer...")
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
                      onClick={() => handleResumeView(item.applicant)}
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

      {/* 🚀 ADMIN RESUME VIEWER - Same PDF.js Experience */}
      {selectedResume && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full h-full max-w-5xl max-h-[95vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h3 className="text-xl font-bold text-gray-800">📄 Resume Viewer</h3>
                <p className="text-gray-600">👤 {selectedResume.applicantName}</p>
                <p className="text-sm text-gray-500">📁 {selectedResume.fileName}</p>
              </div>
              <Button
                onClick={() => setSelectedResume(null)}
                variant="outline"
                size="sm"
                className="text-gray-600 hover:bg-gray-50"
              >
                ✕ Close
              </Button>
            </div>

            {/* PDF Viewer - Same component as student profile */}
            <div className="flex-1 p-6 overflow-auto bg-gray-50">
              <div className="bg-white rounded-lg p-4">
                <PDFViewer
                  pdfUrl={selectedResume.url}
                  fileName={selectedResume.fileName}
                  onPDFFixed={(newUrl) => {
                    setSelectedResume((prev) => ({ ...prev, url: newUrl }))
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-center">
                <p className="text-sm text-gray-600">
                  💼 <strong>Admin Panel:</strong> Same PDF.js viewer as student profile for consistent experience
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApplicantsTable
