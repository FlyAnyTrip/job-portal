"use client"

import { useState } from "react"
import Navbar from "./shared/Navbar"
import { Avatar, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import { Contact, Mail, Pen, User, FileText, Award } from "lucide-react"
import { Badge } from "./ui/badge"
import AppliedJobTable from "./AppliedJobTable"
import UpdateProfileDialog from "./UpdateProfileDialog"
import PDFViewer from "./PDFViewer"
import { useSelector } from "react-redux"
import useGetAppliedJobs from "@/hooks/useGetAppliedJobs"

const Profile = () => {
  useGetAppliedJobs()
  const [open, setOpen] = useState(false)
  const { user } = useSelector((store) => store.auth)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-100">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-8 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>
          <div className="px-8 pb-8">
            <div className="flex justify-between items-start -mt-16">
              <div className="flex items-end space-x-6">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarImage
                    src={user?.profile?.profilePhoto || "https://github.com/shadcn.png"}
                    alt="profile"
                    className="object-cover"
                  />
                </Avatar>
                <div className="pb-4">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{user?.fullname}</h1>
                  <p className="text-gray-600 text-lg">{user?.profile?.bio || "No bio added yet"}</p>
                  <div className="flex items-center space-x-4 mt-3">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      <User className="w-3 h-3 mr-1" />
                      {user?.role}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setOpen(true)}
                className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Pen className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Contact className="w-5 h-5 mr-2 text-purple-600" />
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <Mail className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-800">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <Contact className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-800">{user?.phoneNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-purple-600" />
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {user?.profile?.skills?.length !== 0 ? (
                  user?.profile?.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      className="bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors duration-200"
                    >
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-500">No skills added yet</p>
                )}
              </div>
            </div>

            {/* Resume Section with Enhanced PDF Viewer */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-purple-600" />
                Resume
              </h2>
              {user?.profile?.resume ? (
                <PDFViewer pdfUrl={user.profile.resume} fileName={user.profile.resumeOriginalName} />
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-2">No resume uploaded</p>
                  <Button
                    onClick={() => setOpen(true)}
                    variant="outline"
                    className="text-purple-600 border-purple-300 hover:bg-purple-50"
                  >
                    Upload Resume
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Applied Jobs */}
          <div className="lg:col-span-2">
            <AppliedJobTable />
          </div>
        </div>
      </div>

      <UpdateProfileDialog open={open} setOpen={setOpen} />
    </div>
  )
}

export default Profile
