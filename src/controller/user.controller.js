import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({
    //     message: "message ok"
    // })
    const { fullName, email, username, password } = req.body
    console.log(req.body)
    console.log("email: ", email)
    //Check for empty fields first
    // if (fullName === "") {
    //     throw new ApiError(400, "fullName is required")//

    // }
    if (
        [fullName, email, username, password].some((field) =>
            field?.trim() === ""
        )) {

        throw new ApiError(400, "All fields are required")
    }
    //now check is the user already exists
    //findOne method:finds the first user with the given username/parameter
    //$:operator to check values
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //extract the avatar image to our local 
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.
        coverImage) && req - files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].
            path
    }
    // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) throw new ApiError(400, "Uploading avatar is mandatory")
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!avatar) throw new ApiError(400, "Avatar is rewuired")
    const user = await User.create({
        fullName, avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    //verify user creation 
    const createdUser = await User.findById(user._id).select(//write about what is to be removed/ignored
        //i.e. dont select these two params
        "-password -refreshToken"
    )
    if (!createdUser) throw new ApiError(500, "Somewthing went wrong while registering the user")

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    )
})


//get user details from frontend
//vlaidation- format not empty, etc
//check if user already exists(unique email/username)
//files exist or not(images,avatar)

//upload them to cloudinary
//create objects for db

//remove passwrod and response token field
//check for user creation
//return response



export { registerUser }