"use client"

import { useEffect, useState } from "react"
import Navbar from "../shared/Navbar"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { RadioGroup } from "../ui/radio-group"
import { Button } from "../ui/button"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { USER_API_END_POINT } from "@/utils/constant"
import { toast } from "sonner"
import { useDispatch, useSelector } from "react-redux"
import { setLoading } from "@/redux/authSlice"
import { Loader2, Upload } from "lucide-react"

const Signup = () => {
  const [input, setInput] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "",
    file: null,
  })
  const { loading, user } = useSelector((store) => store.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value })
  }

  const changeFileHandler = (e) => {
    setInput({ ...input, file: e.target.files?.[0] || null })
  }

  const submitHandler = async (e) => {
    e.preventDefault()

    // Validation
    if (!input.fullname || !input.email || !input.phoneNumber || !input.password || !input.role) {
      toast.error("Please fill all required fields")
      return
    }

    const formData = new FormData()
    formData.append("fullname", input.fullname)
    formData.append("email", input.email)
    formData.append("phoneNumber", input.phoneNumber)
    formData.append("password", input.password)
    formData.append("role", input.role)

    // Only append file if it exists
    if (input.file) {
      formData.append("file", input.file)
    }

    try {
      dispatch(setLoading(true))
      const res = await axios.post(`${USER_API_END_POINT}/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      })

      if (res.data.success) {
        navigate("/login")
        toast.success(res.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || "Registration failed")
    } finally {
      dispatch(setLoading(false))
    }
  }

  useEffect(() => {
    if (user) {
      navigate("/")
    }
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Navbar />
      <div className="flex items-center justify-center max-w-7xl mx-auto px-4 py-8">
        <form
          onSubmit={submitHandler}
          className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="text-gray-600 mt-2">Join our job portal today</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="fullname" className="text-gray-700 font-medium">
                Full Name *
              </Label>
              <Input
                id="fullname"
                type="text"
                value={input.fullname}
                name="fullname"
                onChange={changeEventHandler}
                placeholder="Enter your full name"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={input.email}
                name="email"
                onChange={changeEventHandler}
                placeholder="Enter your email"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber" className="text-gray-700 font-medium">
                Phone Number *
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={input.phoneNumber}
                name="phoneNumber"
                onChange={changeEventHandler}
                placeholder="Enter your phone number"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password *
              </Label>
              <Input
                id="password"
                type="password"
                value={input.password}
                name="password"
                onChange={changeEventHandler}
                placeholder="Create a password"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label className="text-gray-700 font-medium mb-3 block">Role *</Label>
              <RadioGroup className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Input
                    type="radio"
                    name="role"
                    value="student"
                    checked={input.role === "student"}
                    onChange={changeEventHandler}
                    className="cursor-pointer w-4 h-4"
                    required
                  />
                  <Label htmlFor="student" className="cursor-pointer">
                    Job Seeker
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="radio"
                    name="role"
                    value="recruiter"
                    checked={input.role === "recruiter"}
                    onChange={changeEventHandler}
                    className="cursor-pointer w-4 h-4"
                    required
                  />
                  <Label htmlFor="recruiter" className="cursor-pointer">
                    Recruiter
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="file" className="text-gray-700 font-medium">
                Profile Photo (Optional)
              </Label>
              <div className="mt-1 flex items-center space-x-2">
                <Input id="file" accept="image/*" type="file" onChange={changeFileHandler} className="cursor-pointer" />
                <Upload className="w-5 h-5 text-gray-400" />
              </div>
              {input.file && <p className="text-sm text-green-600 mt-1">✓ {input.file.name}</p>}
            </div>
          </div>

          <div className="mt-8">
            {loading ? (
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </Button>
            ) : (
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
              >
                Create Account
              </Button>
            )}
          </div>

          <div className="text-center mt-6">
            <span className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                Sign In
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Signup
