import mongoose from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum, TwoStepVerificationEnum } from "../../common/enum/index.js";

const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        minLength: 2,
        maxLength: 50000,
        required: function(){return this.attachments?.length > 0 ? false : true}
    },
    attachments:[String],
    senderId:{type:mongoose.Types.ObjectId,ref:"User"},
    receiverId:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required: function(){ return !this.conversationId }
    },
    conversationId: {
        type: mongoose.Types.ObjectId,
        ref: "Conversation",
        default: null
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    autoIndex: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    strict: true,
    strictQuery: true
});

messageSchema.virtual("isAnonymous").get(function () {
    return !this.conversationId;
});



export const MessageModel = mongoose.models.Message || mongoose.model("Message", messageSchema);