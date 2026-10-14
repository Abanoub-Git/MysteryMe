import mongoose from "mongoose";
import { RequestStatusEnum } from "../../common/enum/request.enum.js";

const requestSchema = new mongoose.Schema({
    messageId: {
        type: mongoose.Types.ObjectId,
        ref: "Message",
        required: true,
        unique: true
    },
    requesterId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    senderId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: Object.values(RequestStatusEnum),
        default: RequestStatusEnum.PENDING
    }
}, {
    timestamps: true,
    autoIndex: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    strict: true,
    strictQuery: true
});

export const RequestModel = mongoose.models.Request || mongoose.model("Request", requestSchema);
