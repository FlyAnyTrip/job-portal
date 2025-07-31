"use client"

import { setAllAdminJobs } from "@/redux/jobSlice"
import { JOB_API_END_POINT } from "@/utils/constant"
import axios from "axios"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

const useGetAllAdminJobs = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((store) => store.auth)

  useEffect(() => {
    const fetchAllAdminJobs = async () => {
      try {
        // Only fetch if user is logged in and is a recruiter
        if (!user || user.role !== "recruiter") {
          console.log("User not authorized for admin jobs")
          return
        }

        console.log("Fetching admin jobs for user:", user.fullname)

        const res = await axios.get(`${JOB_API_END_POINT}/getadminjobs`, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        })

        console.log("Admin jobs response:", res.data)

        if (res.data.success) {
          dispatch(setAllAdminJobs(res.data.jobs))
        } else {
          console.error("Failed to fetch admin jobs:", res.data.message)
          dispatch(setAllAdminJobs([]))
        }
      } catch (error) {
        console.error("Error fetching admin jobs:", error)
        console.error("Error response:", error.response?.data)
        dispatch(setAllAdminJobs([]))
      }
    }

    fetchAllAdminJobs()
  }, [dispatch, user])
}

export default useGetAllAdminJobs
