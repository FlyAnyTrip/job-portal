const API_BASE_URL =
  process.env.NODE_ENV === "production" ? "https://job-portal-bbkujn.vercel.app/api/v1" : "http://localhost:8000/api/v1"

export const USER_API_END_POINT = `${API_BASE_URL}/user`
export const JOB_API_END_POINT = `${API_BASE_URL}/job`
export const APPLICATION_API_END_POINT = `${API_BASE_URL}/application`
export const COMPANY_API_END_POINT = `${API_BASE_URL}/company`
