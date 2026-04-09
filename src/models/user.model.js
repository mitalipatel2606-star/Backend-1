import mongoose from "mongoose";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// import { JsonWebTokenError } from "jsonwebtoken";
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        index: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        index: true,


        trim: true
    },
    avatar: {
        type: String,
        required: true //cloudinary url
    },
    coverImage: {
        type: String //cloudinary url
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        },

    ],
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    //two things: refresh token and access token 
    //access token checks the authentication: user and db should have the same
    //refreshToken stays viable for a time limit after , it should be again, same for the user 
    //and the db
    //if it isnt the same (becuase the time limit has expired, then a new one has to be generated)
    refreshToken: {

        type: String
    }

}, {
    timestamps: true
})

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
})
// this is how a user defined function is written for/in/using mongoose object
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
    //here password is the original what user entered and this.password is the encrypted one 
    //boolean true or false 
}
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            //as they are refreshed more frequently
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User", userSchema);