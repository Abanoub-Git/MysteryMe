import { BadException, ConflictException, ForbiddenException, NotfoundException } from "../../common/exceptions/error.exception.js";
import { findById as findMessageById } from "../../common/repository/message.repository.js";
import { createOne as createOneRequest, findById as findRequestById, findByIdAndUpdate as findRequestByIdAndUpdate, findOne as findOneRequest, paginate as paginateRequests } from "../../common/repository/request.repository.js";
import { createOne as createOneConversation, findOne as findOneConversation } from "../../common/repository/conversation.repository.js";
import { RequestStatusEnum } from "../../common/enum/request.enum.js";
import { UserModel } from "../../DB/model/user.model.js";
import { findById as findUserById } from "../../common/repository/db.repository.js";

export const requestSenderIdentity = async ({ messageId }, user) => {
    const message = await findMessageById({ id: messageId });
    if (!message) {
        throw NotfoundException("Invalid message Id");
    }
    
    if (message.receiverId.toString() !== user._id.toString()) {
        throw ForbiddenException("Forbidden: You are not authorized to request identity for this message");
    }

    if (message.conversationId) {
        throw BadException("Cannot request identity for a direct conversation message");
    }
    
    if (!message.senderId) {
        throw BadException("Cannot request identity for an unregistered or anonymous sender");
    }
    
    if (message.senderId.toString() === user._id.toString()) {
        throw ConflictException("Cannot request identity for your own message");
    }
    
    const existingRequest = await findOneRequest({ filter: { messageId } });
    if (existingRequest) {
        throw ConflictException("Identity request already exists for this message");
    }
    
    const newRequest = await createOneRequest({
        data: {messageId: message._id,requesterId: user._id,senderId: message.senderId,status: RequestStatusEnum.PENDING}
    });

    return {_id: newRequest._id,messageId: newRequest.messageId,requesterId: newRequest.requesterId,status: newRequest.status};
};

export const getReceivedIdentityRequests = async ({ page, limit } = {}, user) => {
    const filter = { senderId: user._id };
    const data = await paginateRequests({page,limit,filter,options: { sort: { createdAt: -1 } }});
    return data;
};

export const getSentIdentityRequests = async ({ page, limit } = {}, user) => {
    const filter = { requesterId: user._id };
    const data = await paginateRequests({ page, limit, filter, options: { sort: { createdAt: -1 } } });
    if (data && data.docs) {
        for (let i = 0; i < data.docs.length; i++) {
            const doc = data.docs[i];
            const docObj = doc.toObject ? doc.toObject() : { ...doc };
            if (docObj.status === RequestStatusEnum.ACCEPTED) {
                const sender = await findUserById({ model: UserModel, id: docObj.senderId });
                if (sender) {
                    docObj.sender = {
                        _id: sender._id,
                        firstName: sender.firstName,
                        lastName: sender.lastName,
                        username: sender.username,
                        email: sender.email,
                        profileImage: sender.profileImage || sender.image
                    };
                }
                const conversation = await findOneConversation({ filter: { messageId: docObj.messageId } });
                if (conversation) {
                    docObj.conversation = conversation;
                }
            } else {
                delete docObj.senderId;
            }
            data.docs[i] = docObj;
        }
    }
    return data;
};

export const getIdentityRequests = getReceivedIdentityRequests;

export const updateIdentityRequestStatus = async ({ requestId, status }, user) => {
    const request = await findRequestById({ id: requestId });
    if (!request) {
        throw NotfoundException("Invalid request Id");
    }

    if (request.senderId.toString() !== user._id.toString()) {
        throw ForbiddenException("Forbidden: You are not authorized to respond to this request");
    }

    if (request.status !== RequestStatusEnum.PENDING) {
        throw ConflictException("Request has already been processed");
    }

    let normalizedStatus;
    if (status === "accept" || status === RequestStatusEnum.ACCEPTED) {
        normalizedStatus = RequestStatusEnum.ACCEPTED;
    } else if (status === "reject" || status === RequestStatusEnum.REJECTED) {
        normalizedStatus = RequestStatusEnum.REJECTED;
    } else {
        throw BadException("Invalid status, must be accepted or rejected");
    }

    const updatedRequest = await findRequestByIdAndUpdate({
        id: requestId,
        update: { status: normalizedStatus }
    });

    const requestObj = updatedRequest.toObject ? updatedRequest.toObject() : { ...updatedRequest };

    if (normalizedStatus === RequestStatusEnum.ACCEPTED) {
        let conversation = await findOneConversation({ filter: { messageId: request.messageId } });
        if (!conversation) {
            conversation = await createOneConversation({
                data: {
                    messageId: request.messageId,
                    requestId: request._id,
                    participants: [request.senderId, request.requesterId]
                }
            });
        }
        requestObj.conversation = conversation;
    } else if (normalizedStatus === RequestStatusEnum.REJECTED) {
        delete requestObj.senderId;
    }

    return requestObj;
};

export const getIdentityRequestById = async ({ requestId }, user) => {
    const request = await findRequestById({ id: requestId });
    if (!request) {
        throw NotfoundException("Invalid request Id");
    }

    const isRequester = request.requesterId.toString() === user._id.toString();
    const isSender = request.senderId.toString() === user._id.toString();

    if (!isRequester && !isSender) {
        throw ForbiddenException("Forbidden: You are not authorized to view this request");
    }

    const requestObj = request.toObject ? request.toObject() : { ...request };
    if (isRequester && request.status !== RequestStatusEnum.ACCEPTED) {
        delete requestObj.senderId;
    }

    if (request.status === RequestStatusEnum.ACCEPTED) {
        const sender = await findUserById({ model: UserModel, id: request.senderId });
        if (sender) {
            requestObj.sender = {
                _id: sender._id,
                firstName: sender.firstName,
                lastName: sender.lastName,
                username: sender.username,
                email: sender.email,
                profileImage: sender.profileImage || sender.image
            };
        }
        const conversation = await findOneConversation({ filter: { messageId: request.messageId } });
        if (conversation) {
            requestObj.conversation = conversation;
        }
    }

    return requestObj;
};
