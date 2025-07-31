// Production ke liye updated constants
const isDevelopment = import.meta.env.DEV
const API_BASE_URL = isDevelopment ? "http://localhost:8000" : "https://your-backend-app.vercel.app"

export const USER_API_END_POINT = `${API_BASE_URL}/api/v1/user`
export const JOB_API_END_POINT = `${API_BASE_URL}/api/v1/job`
export const APPLICATION_API_END_POINT = `${API_BASE_URL}/api/v1/application`
export const COMPANY_API_END_POINT = `${API_BASE_URL}/api/v1/company`

// File upload constraints
export const MAX_FILE_SIZE_MB = 5
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
export const ALLOWED_DOCUMENT_TYPES = ["application/pdf"]
