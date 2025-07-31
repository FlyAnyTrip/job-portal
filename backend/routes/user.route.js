import express from "express"
import {
  login,
  logout,
  register,
  updateProfile,
  getPDFProxy,
  servePDF,
  fixPDFAccess,
} from "../controllers/user.controller.js"
import isAuthenticated from "../middlewares/isAuthenticated.js"
import { singleUpload } from "../middlewares/mutler.js"

const router = express.Router()

router.route("/register").post(singleUpload, register)
router.route("/login").post(login)
router.route("/logout").get(logout)
router.route("/profile/update").post(isAuthenticated, singleUpload, updateProfile)

// PDF serving routes
router.route("/pdf-proxy").get(getPDFProxy)
router.route("/serve-pdf/:publicId").get(servePDF)

// NEW: Fix existing PDF access
router.route("/fix-pdf-access").post(isAuthenticated, fixPDFAccess)

export default router
