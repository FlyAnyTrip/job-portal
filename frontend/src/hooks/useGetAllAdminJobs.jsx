"use client"

import { setAllAdminJobs } from "@/redux/jobSlice"
import { JOB_API_END_POINT } from "@/utils/constant"
import api from "@/utils/api"
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

        console.log("[v0] Fetching admin jobs for user:", user.fullname)

        const res = await api.get(`${JOB_API_END_POINT}/getadminjobs`)

        console.log("[v0] Admin jobs response:", res.data)

        if (res.data.success) {
          dispatch(setAllAdminJobs(res.data.jobs))
        } else {
          console.error("Failed to fetch admin jobs:", res.data.message)
          dispatch(setAllAdminJobs([]))
        }
      } catch (error) {
        console.error("[v0] Error fetching admin jobs:", error)
        console.error("[v0] Error response:", error.response?.data)
        dispatch(setAllAdminJobs([]))
      }
    }

    fetchAllAdminJobs()
  }, [dispatch, user])
}

export default useGetAllAdminJobs
