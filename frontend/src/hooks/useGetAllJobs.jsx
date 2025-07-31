"use client"

import { setAllJobs } from "@/redux/jobSlice"
import { JOB_API_END_POINT } from "@/utils/constant"
import axios from "axios"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

const useGetAllJobs = () => {
  const dispatch = useDispatch()
  const { searchedQuery } = useSelector((store) => store.job)

  useEffect(() => {
    const fetchAllJobs = async () => {
      try {
        console.log("Fetching jobs from:", `${JOB_API_END_POINT}/get?keyword=${searchedQuery}`)

        const res = await axios.get(`${JOB_API_END_POINT}/get?keyword=${searchedQuery}`, {
          headers: {
            "Content-Type": "application/json",
          },
        })

        console.log("Jobs response:", res.data)

        if (res.data.success) {
          dispatch(setAllJobs(res.data.jobs))
        } else {
          console.error("Failed to fetch jobs:", res.data.message)
          dispatch(setAllJobs([]))
        }
      } catch (error) {
        console.error("Error fetching jobs:", error)
        console.error("Error response:", error.response?.data)
        dispatch(setAllJobs([]))
      }
    }

    fetchAllJobs()
  }, [searchedQuery, dispatch])
}

export default useGetAllJobs
