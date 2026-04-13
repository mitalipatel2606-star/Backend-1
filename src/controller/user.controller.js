import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import { use } from "react";
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access tokens")
    }
}
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
        coverImage) && req.files.coverImage.length > 0) {
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
//1.register User steps
//get user details from frontend
//vlaidation- format not empty, etc
//check if user already exists(unique email/username)
//files exist or not(images,avatar)

//upload them to cloudinary
//create objects for db

//remove passwrod and response token field
//check for user creation
//return response
const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body
    if (!username && !email) {// since we are using express.json() middleware we must sent the data as  raw json response
        throw new ApiError(400, "Username or Email is required")
    }
    const user = await User.findOne(
        { $or: [{ username }, { email }] }
    )
    if (!user) {
        throw new ApiError(404, "User doesn't exist")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect credentials ")
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).
        select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged in successfully"
            )
        )

})
//2.login user steps
//extract the data from the req body
//unique identifier: through email or username
//find the user 
//authentication(passwprd checking)
//access and refresh token
//send cookie //return in the end

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        }, {
        new: true
    }
    )
    //options are cookie configuration settings
    //cookie must be cleared with the same options it was set with
    const options = {
        httpOnly: true,//js cannot read the cookie, prevents from xss attacks
        secure: true//only sent on the https, prevents man in the middle attack
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, " User logged out successfully")
        )
})
//$set method used to specify in mongoose which fields need to be modified
// to logout just delete the refresh token of the user which you can query 
//from the database using the id which was added fromt he suer from user.id

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorised request(incorrect token")

    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            return new ApiError(401, "Invalid refresh token")
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, " Refresh token is expired or used")
        }
        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)
        return res
            .status(200)
            .cookie("accessToken", accessToken.options)
            .cookie("refreshToken", newRefreshTokenefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refresh successfully"
                )
            )

    } catch (error) {
        throw new ApiError(
            401,
            error?.message || "Invalid refresh token"
        )

    }
})

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")

    }
    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(200, req.user, "Current user fetched successfully")
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body
    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }
    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        { new: true }// if the fields have been updated then this return a message, thus store it 
    ).select("-password ")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"))

})
const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(
            400,
            "Avatar file is missing"
        )
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")
})


// const updateUserAvatar


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar
}