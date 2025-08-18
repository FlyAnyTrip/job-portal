"use client"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Button } from "../ui/button"
import { Avatar, AvatarImage } from "../ui/avatar"
import { LogOut, User2, Briefcase, Building } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import axios from "axios"
import { USER_API_END_POINT } from "@/utils/constant"
import { setUser } from "@/redux/authSlice"
import { toast } from "sonner"

const Navbar = () => {
  const { user } = useSelector((store) => store.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const logoutHandler = async () => {
    try {
      const res = await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true })
      if (res.data.success) {
        dispatch(setUser(null))
        navigate("/")
        toast.success(res.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response.data.message)
    }
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between mx-auto max-w-7xl h-16 px-4">
        <div>
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              JobPortal
            </h1>
          </Link>
        </div>

        <div className="flex items-center gap-8">
          <ul className="flex font-medium items-center gap-6">
            {user && user.role === "recruiter" ? (
              <>
                <li>
                  <Link
                    to="/admin/companies"
                    className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-all duration-200"
                  >
                    <Building className="w-4 h-4" />
                    <span>Companies</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/jobs"
                    className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-all duration-200"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Jobs</span>
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/"
                    className="px-3 py-2 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-all duration-200"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/jobs"
                    className="px-3 py-2 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-all duration-200"
                  >
                    Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/browse"
                    className="px-3 py-2 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-all duration-200"
                  >
                    Browse
                  </Link>
                </li>
              </>
            )}
          </ul>

          {!user ? (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button
                  variant="outline"
                  className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600 transition-all duration-200 bg-transparent"
                >
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                  Signup
                </Button>
              </Link>
            </div>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Avatar className="cursor-pointer ring-2 ring-purple-200 hover:ring-purple-400 transition-all duration-200">
                  <AvatarImage src={user?.profile?.profilePhoto || "/placeholder.svg"} alt="@user" />
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 bg-white shadow-xl border border-gray-200 rounded-xl">
                <div className="p-4">
                  <div className="flex gap-3 items-center mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user?.profile?.profilePhoto || "/placeholder.svg"} alt="@user" />
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-gray-800">{user?.fullname}</h4>
                      <p className="text-sm text-gray-500">{user?.profile?.bio || "No bio added"}</p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    {user && user.role === "student" && (
                      <Link to="/profile">
                        <Button
                          variant="ghost"
                          className="w-full justify-start hover:bg-purple-50 hover:text-purple-600 transition-all duration-200"
                        >
                          <User2 className="w-4 h-4 mr-2" />
                          View Profile
                        </Button>
                      </Link>
                    )}

                    <Button
                      onClick={logoutHandler}
                      variant="ghost"
                      className="w-full justify-start hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
