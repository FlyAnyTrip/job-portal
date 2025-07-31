import jwt from "jsonwebtoken"

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token
    console.log("Auth middleware - Checking token for:", req.url)
    console.log("Token present:", token ? "Yes" : "No")

    if (!token) {
      console.log("No token found in cookies")
      return res.status(401).json({
        message: "User not authenticated - No token provided",
        success: false,
      })
    }

    const decode = await jwt.verify(token, process.env.SECRET_KEY)
    if (!decode) {
      console.log("Invalid token")
      return res.status(401).json({
        message: "Invalid token",
        success: false,
      })
    }

    console.log("Token verified for user ID:", decode.userId)
    req.id = decode.userId
    next()
  } catch (error) {
    console.log("Auth middleware error:", error.message)
    return res.status(401).json({
      message: "Authentication failed",
      success: false,
    })
  }
}

export default isAuthenticated
