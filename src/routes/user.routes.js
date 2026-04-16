import { Router } from "express"
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
} from "../controller/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js"


const router = Router();
//add a middleware in the post method itself
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)

//we use our user-made verifyJWT middleware to check whether or not the user is logged in
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/chnage-password").post(verifyJWT, changePassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
//upload.single to upload just one field
router.route("/avtar").patch(verifyJWT, upload.single("avtar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("cover-image"), updateUserCoverImage)

router.route("/c/:username").get((verifyJWT, getUserChannelProfile))
router.route("/history").get(verifyJWT, getWatchHistory)
export default router