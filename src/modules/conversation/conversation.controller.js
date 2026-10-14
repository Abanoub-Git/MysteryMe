import { Router } from "express";
import { fileValidation, localFileUpload, successResponse } from "../../common/utils/index.js";
import { authentication } from "../../middleware/authentication.middleware.js";
import { uploadMiddleware } from "../../middleware/multer.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from "./conversation.validation.js";
import { deleteConversation, getConversationById, getConversationMessages, getUserConversations, sendMessageInConversation } from "./conversation.service.js";

const router = Router();
const messageFolderName = "messages";

const sendMessageMiddleware = [
    authentication(),
    uploadMiddleware({
        multerMiddleware: localFileUpload().any("attachments", 3),
        validation: fileValidation.image,
        customPath: messageFolderName,
        isRequired: false
    }),
    validation(validators.sendMessageInConversation)
];

router.get("/", authentication(), async (req, res) => {
    const data = await getUserConversations(req.user);
    return successResponse({ res, data });
});

router.get("/:conversationId", authentication(), validation(validators.conversationParam), async (req, res) => {
    const conversationId = req.validate?.params?.conversationId || req.params?.conversationId;
    const data = await getConversationById({ conversationId }, req.user);
    return successResponse({ res, data });
});

router.get("/:conversationId/messages", authentication(), validation(validators.getConversationMessages), async (req, res) => {
        const conversationId = req.validate?.params?.conversationId;
        const data = await getConversationMessages({ conversationId }, req.user);
        return successResponse({ res, data });
    }
);

router.post(["/:conversationId", "/:conversationId/messages"], ...sendMessageMiddleware, async (req, res) => {
        const conversationId = req.validate?.params?.conversationId;
        const { content } = req.validate?.body || {};
        const data = await sendMessageInConversation({ conversationId, content }, req.files, req.user);
        return successResponse({ res, status: 201, data });
    }
);

router.delete("/:conversationId", authentication(), validation(validators.deleteConversation), async (req, res) => {
        const conversationId = req.validate?.params?.conversationId;
        const data = await deleteConversation({ conversationId }, req.user);
        return successResponse({ res, data });
    }
);

export default router;