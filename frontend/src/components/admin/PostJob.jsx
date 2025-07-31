"use client"

import { useState } from "react"
import Navbar from "../shared/Navbar"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useSelector } from "react-redux"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import axios from "axios"
import { JOB_API_END_POINT } from "@/utils/constant"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"

const PostJob = () => {
  const [input, setInput] = useState({
    title: "",
    description: "",
    requirements: "",
    salary: "",
    location: "",
    jobType: "",
    experience: "",
    position: 1,
    companyId: "",
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { companies } = useSelector((store) => store.company)

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value })
  }

  const selectChangeHandler = (value) => {
    const selectedCompany = companies.find((company) => company.name.toLowerCase() === value)
    setInput({ ...input, companyId: selectedCompany._id })
  }

  const submitHandler = async (e) => {
    e.preventDefault()

    // Validate required fields
    if (
      !input.title ||
      !input.description ||
      !input.requirements ||
      !input.salary ||
      !input.location ||
      !input.jobType ||
      !input.experience ||
      !input.position ||
      !input.companyId
    ) {
      toast.error("Please fill all required fields")
      return
    }

    // Validate salary is a number
    if (isNaN(Number.parseFloat(input.salary))) {
      toast.error("Please enter a valid salary amount (numbers only)")
      return
    }

    // Validate experience is a number
    if (isNaN(Number.parseInt(input.experience))) {
      toast.error("Please enter experience in years (numbers only, e.g., 2)")
      return
    }

    try {
      setLoading(true)
      const res = await axios.post(`${JOB_API_END_POINT}/post`, input, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      })
      if (res.data.success) {
        toast.success(res.data.message)
        navigate("/admin/jobs")
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || "Failed to post job")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar />
      <div className="flex items-center justify-center w-screen my-5">
        <form onSubmit={submitHandler} className="p-8 max-w-4xl border border-gray-200 shadow-lg rounded-md">
          <h1 className="font-bold text-xl mb-4">Post New Job</h1>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Title *</Label>
              <Input
                type="text"
                name="title"
                value={input.title}
                onChange={changeEventHandler}
                placeholder="e.g., Frontend Developer"
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                required
              />
            </div>
            <div>
              <Label>Description *</Label>
              <Input
                type="text"
                name="description"
                value={input.description}
                onChange={changeEventHandler}
                placeholder="Job description"
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                required
              />
            </div>
            <div>
              <Label>Requirements *</Label>
              <Input
                type="text"
                name="requirements"
                value={input.requirements}
                onChange={changeEventHandler}
                placeholder="React, JavaScript, HTML (comma separated)"
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                required
              />
            </div>
            <div>
              <Label>Salary (Annual in ₹) *</Label>
              <Input
                type="number"
                name="salary"
                value={input.salary}
                onChange={changeEventHandler}
                placeholder="e.g., 500000 (for 5 LPA)"
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                required
              />
            </div>
            <div>
              <Label>Location *</Label>
              <Input
                type="text"
                name="location"
                value={input.location}
                onChange={changeEventHandler}
                placeholder="e.g., Mumbai, Delhi"
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                required
              />
            </div>
            <div>
              <Label>Job Type *</Label>
              <Input
                type="text"
                name="jobType"
                value={input.jobType}
                onChange={changeEventHandler}
                placeholder="e.g., Full-time, Part-time"
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                required
              />
            </div>
            <div>
              <Label>Experience Level (Years) *</Label>
              <Input
                type="number"
                name="experience"
                value={input.experience}
                onChange={changeEventHandler}
                placeholder="e.g., 2 (for 2 years)"
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                min="0"
                required
              />
            </div>
            <div>
              <Label>No of Positions *</Label>
              <Input
                type="number"
                name="position"
                value={input.position}
                onChange={changeEventHandler}
                placeholder="e.g., 5"
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                min="1"
                required
              />
            </div>
            {companies.length > 0 && (
              <div className="col-span-2">
                <Label>Select Company *</Label>
                <Select onValueChange={selectChangeHandler} required>
                  <SelectTrigger className="w-full my-1">
                    <SelectValue placeholder="Select a Company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {companies.map((company) => {
                        return (
                          <SelectItem key={company._id} value={company?.name?.toLowerCase()}>
                            {company.name}
                          </SelectItem>
                        )
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {loading ? (
            <Button className="w-full my-4" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
            </Button>
          ) : (
            <Button type="submit" className="w-full my-4">
              Post New Job
            </Button>
          )}

          {companies.length === 0 && (
            <p className="text-xs text-red-600 font-bold text-center my-3">
              *Please register a company first, before posting jobs
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

export default PostJob
