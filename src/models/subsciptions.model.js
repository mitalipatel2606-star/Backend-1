import mongoose, { Mongoose, Schema } from "mongoose";
import { User } from "./user.model";
const subscriptionSchema = new mongoose.Schema({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }


},
    {
        timestamps: required
    }
)

export const Subscription = mongoose.Model("subscriptionSchema", Subscription)