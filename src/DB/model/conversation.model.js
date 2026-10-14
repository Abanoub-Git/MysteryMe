import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    messageId: {
        type: mongoose.Types.ObjectId,
        ref: "Message",
        required: true,
        unique: true
    },
    requestId: {
        type: mongoose.Types.ObjectId,
        ref: "Request"
    },
    participants: [{
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    }]
}, {
    timestamps: true,
    autoIndex: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    strict: true,
    strictQuery: true
});

export const ConversationModel = mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);
