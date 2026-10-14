import { NotfoundException } from "../../common/exceptions/error.exception.js";
import {findById as findUserById} from "../../common/repository/db.repository.js";
import { createOne, deleteOne, findOne, findOneAndUpdate, countDocument, paginate } from "../../common/repository/message.repository.js";
import { UserModel } from './../../DB/model/user.model.js';

export const createMessage = async ({ content, receiverId } = {}, files = [], user = undefined) => {
    const checkReceiverExist = await findUserById({
        model: UserModel,
        id: receiverId
    });
    if (!checkReceiverExist) {
        throw NotfoundException("Invalid receiver Id");
    }
    const message = await createOne({
        data: {
            senderId: user?._id,
            receiverId,
            content,
            attachments: files.map(e => e.path),
            conversationId: null
        }
    });
    return message;
};



export const getAllMessages = async ({ type, page, limit } = {}, user) => {
    const anonymousFilter = {
        $or: [
            { conversationId: null },
            { conversationId: { $exists: false } }
        ]
    };

    let filter = {};
    if (type === "0") {
        filter = {
            receiverId: user._id,
            ...anonymousFilter
        };
    } else if (type === "1") {
        filter = {
            senderId: user._id,
            ...anonymousFilter
        };
    } else {
        filter = {
            $and: [
                { $or: [{ senderId: user._id }, { receiverId: user._id }] },
                anonymousFilter
            ]
        };
    }

    const data = await paginate({ page, limit, filter, options: { sort: { createdAt: -1 } } });

    // Protect sender identity: Do not leak senderId in response to receiver before identity is authorized
    if (data && Array.isArray(data.docs)) {
        data.docs = data.docs.map((doc) => {
            const docObj = doc.toObject ? doc.toObject() : { ...doc };
            if (docObj.receiverId && docObj.receiverId.toString() === user._id.toString()) {
                delete docObj.senderId;
            }
            return docObj;
        });
    }

    const unreadCount = await countDocument({
        filter: {
            receiverId: user._id,
            isRead: false,
            ...anonymousFilter
        }
    });

    return { ...data, unreadCount };
};



export const getMessage = async ({ messageId }, user) => {
    const data = await findOneAndUpdate({
        filter: {
            receiverId: user._id,
            _id: messageId,
            $or: [{ conversationId: null }, { conversationId: { $exists: false } }]
        },
        update: { $set: { isRead: true } }
    });
    if (!data) {
        throw NotfoundException("Invalid messageId");
    }
    const docObj = data.toObject ? data.toObject() : { ...data };
    delete docObj.senderId;
    return docObj;
};

export const markMessageAsRead = async ({ messageId }, user) => {
    const data = await findOneAndUpdate({
        filter: {
            receiverId: user._id,
            _id: messageId,
            $or: [{ conversationId: null }, { conversationId: { $exists: false } }]
        },
        update: { $set: { isRead: true } }
    });
    if (!data) {
        throw NotfoundException("Invalid messageId");
    }
    const docObj = data.toObject ? data.toObject() : { ...data };
    delete docObj.senderId;
    return docObj;
};


export const deleteMessage = async ({ messageId }, user) => {
    const data = await deleteOne({
        filter: {
            receiverId: user._id,
            _id: messageId,
            $or: [{ conversationId: null }, { conversationId: { $exists: false } }]
        }
    });
    if (!data.deletedCount) {
        throw NotfoundException("Invalid messageId");
    }
    return data;
};




/* 
Get mes by id ya enta alsender law enta auth, y enta alreceiver bta3ha
Get all swa2 ana sender aw receiver 
Delete alreceiver bs ali y2dr yms7 alresala
No Update 
*/