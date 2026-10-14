import fs from "fs";
import mongoose from "mongoose";
import { ForbiddenException, NotfoundException } from "../../common/exceptions/error.exception.js";
import { findById as findConversationById, find as findConversations,deleteOne as deleteOneConversation } from "../../common/repository/conversation.repository.js";
import { createOne as createOneMessage, find as findMessages,deleteMany as deleteManyMessages } from "../../common/repository/message.repository.js";
import { ConversationModel } from "../../DB/model/conversation.model.js";
import { MessageModel } from "../../DB/model/message.model.js";

const getAuthorizedConversation = async ({ conversationId }, user) => {
    const conversation = await findConversationById({ id: conversationId });
    if (!conversation) {
        throw NotfoundException("Conversation not found");
    }
    const isParticipant = conversation.participants.some(
        (p) => (p._id || p).toString() === user._id.toString()
    );
    if (!isParticipant) {
        throw ForbiddenException("Forbidden: You are not authorized to access this conversation");
    }
    return conversation;
};

export const getUserConversations = async (user) => {
    const conversations = await findConversations({
        filter: { participants: user._id },
        options: {
            sort: { updatedAt: -1 },
            populate: [{ path: "participants", select: "firstName lastName username profileImage image email" }]
        }
    });
    return conversations;
};

export const getConversationById = async ({ conversationId }, user) => {
    const conversation = await findConversationById({
        id: conversationId,
        options: {
            populate: [{ path: "participants", select: "firstName lastName username profileImage image email" }]
        }
    });
    if (!conversation) {
        throw NotfoundException("Conversation not found");
    }
    const isParticipant = conversation.participants.some(
        (p) => (p._id || p).toString() === user._id.toString()
    );
    if (!isParticipant) {
        throw ForbiddenException("Forbidden: You are not authorized to access this conversation");
    }
    return conversation;
};

export const sendMessageInConversation = async ({ conversationId, content } = {}, files = [], user) => {
    const conversation = await getAuthorizedConversation({ conversationId }, user);
    const receiverId = conversation.participants.find((p) => (p._id || p).toString() !== user._id.toString());
    const attachments = files && Array.isArray(files) ? files.map((f) => f.path) : [];
    const message = await createOneMessage({
        data: {conversationId: conversation._id,senderId: user._id,receiverId,content,attachments}
    });
    return message;
};

export const getConversationMessages = async ({ conversationId } = {}, user) => {
    await getAuthorizedConversation({ conversationId }, user);
    const messages = await findMessages({
        filter: { conversationId },
        options: {
            sort: { createdAt: 1 },
            populate: [{ path: "senderId", select: "firstName lastName username profileImage image" }]
        }
    });
    return messages;
};

export const deleteConversation = async ({ conversationId }, user) => {
    // 1. Check if the conversation exists in MongoDB
    const conversation = await findConversationById({ id: conversationId });

    // Stale conversation: if already absent from DB, treat deletion as an idempotent operation
    if (!conversation) {
        // Safely clean up any leftover messages referencing this conversationId
        try {
            await deleteManyMessages({ filter: { conversationId } });
        } catch {
            // Ignore message deletion error if already empty
        }
        return {
            success: true,
            alreadyDeleted: true,
            message: "Conversation is already deleted",
            conversationId
        };
    }

    // 2. Enforce participant authorization: never allow a non-participant to delete an existing conversation
    const isParticipant = conversation.participants.some(
        (p) => (p._id || p).toString() === user._id.toString()
    );
    if (!isParticipant) {
        throw ForbiddenException("Forbidden: You are not authorized to access this conversation");
    }

    // 3. Collect attachment filepaths to clean up disk assets
    const messages = await findMessages({
        filter: { conversationId: conversation._id }
    });
    const attachmentsToClean = [];
    if (Array.isArray(messages)) {
        for (const msg of messages) {
            if (Array.isArray(msg.attachments)) {
                attachmentsToClean.push(...msg.attachments);
            }
        }
    }

    // 4. Perform atomic deletion with transaction if replica set is enabled, otherwise safe sequence
    let session = null;
    let transactionActive = false;
    try {
        session = await mongoose.startSession();
        session.startTransaction();
        transactionActive = true;
    } catch {
        session = null;
        transactionActive = false;
    }

    try {
        if (transactionActive && session) {
            await MessageModel.deleteMany({ conversationId: conversation._id }).session(session);
            await ConversationModel.deleteOne({ _id: conversation._id }).session(session);
            await session.commitTransaction();
        } else {
            await deleteManyMessages({ filter: { conversationId: conversation._id } });
            await deleteOneConversation({ filter: { _id: conversation._id } });
        }
    } catch (err) {
        if (transactionActive && session) {
            try { await session.abortTransaction(); } catch {}
        }
        throw err;
    } finally {
        if (session) {
            try { session.endSession(); } catch {}
        }
    }

    // 5. Safely remove orphaned attachment files from disk
    for (const filePath of attachmentsToClean) {
        try {
            if (filePath && fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
            }
        } catch {
            // Ignore file unlink errors
        }
    }

    return {
        success: true,
        alreadyDeleted: false,
        message: "Conversation and all associated messages permanently deleted",
        conversationId: conversation._id
    };
};
