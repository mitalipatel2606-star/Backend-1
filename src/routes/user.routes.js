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
import { validate } from "../middleware/validate.middleware.js";
import {
    changePasswordSchema,
    channelProfileParamsSchema,
    loginUserSchema,
    refreshAccessTokenSchema,
    registerUserSchema,
    updateAccountDetailsSchema
} from "../validation/user.validation.js";


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
    validate({ body: registerUserSchema }),
    registerUser)

//we use our user-made verifyJWT middleware to check whether or not the user is logged in
router.route("/login").post(validate({ body: loginUserSchema }), loginUser)
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(validate({ body: refreshAccessTokenSchema }), refreshAccessToken)
router.route("/change-password").post(verifyJWT, validate({ body: changePasswordSchema }), changePassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, validate({ body: updateAccountDetailsSchema }), updateAccountDetails)
//upload.single to upload just one field
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/c/:username").get(verifyJWT, validate({ params: channelProfileParamsSchema }), getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)
export default router
