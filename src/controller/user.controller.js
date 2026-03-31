import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "message ok"
    })
    const { fullName, email, username, password } = req.body
    console.log("email: ,", email)
    //Check for empty fields first
    // if (fullName === "") {
    //     throw new ApiError(400, "fullname is required")//

    // }
    if (
        [fullName, email, username, password].some((field) =>
            field?.trim() === ""
        )) {

        throw new ApiError(400, "All fields are required")
    }
    //now check is the user already exists

})
//get user details from frontend
//vlaidation- format not empty, etc
//check if user already exists(unique email/username)
//files exist or not(images,avatar)
//create objects for db
//upload them to cloudinary
//remove passwrod and response token field
//check for user creation
//return response



export { registerUser }