"use client"

import { setCompanies } from "@/redux/companySlice"
import { COMPANY_API_END_POINT } from "@/utils/constant"
import axios from "axios"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

const useGetAllCompanies = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((store) => store.auth)

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        // Only fetch if user is logged in and is a recruiter
        if (!user || user.role !== "recruiter") {
          console.log("User not authorized for companies")
          return
        }

        console.log("Fetching companies for user:", user.fullname)

        const res = await axios.get(`${COMPANY_API_END_POINT}/get`, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        })

        console.log("Companies response:", res.data)

        if (res.data.success) {
          dispatch(setCompanies(res.data.companies))
        } else {
          console.error("Failed to fetch companies:", res.data.message)
          dispatch(setCompanies([]))
        }
      } catch (error) {
        console.error("Error fetching companies:", error)
        console.error("Error response:", error.response?.data)
        dispatch(setCompanies([]))
      }
    }

    fetchCompanies()
  }, [dispatch, user])
}

export default useGetAllCompanies
