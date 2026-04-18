import mongoose from "mongoose";
import { Schema } from mongoose;
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new mongoose.Schema({
    videoFile: {
        type: String, //cloudinary
        required: true
    },
    thumbnail: {
        type: String, //cloudinary
        required: true
    },
    title: {
        type: String, //cloudinary
        required: true
    },
    description: {
        type: String, //cloudinary
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    views: {
        type: Number,
        defualt: 0
    },
    published: {
        type: Boolean,
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId, //cloudinary
        required: true,
        ref: "User"
    }


}, {
    timestamps: true
})
videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);