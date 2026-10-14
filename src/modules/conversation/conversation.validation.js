import { z } from 'zod';
import { generalValidationFields } from '../../common/validation.js';

export const sendMessageInConversation = (lang) => {
    return z.object({
        params: z.object({
            conversationId: generalValidationFields.id.optional()
        }).optional(),
        body: z.object({
            conversationId: generalValidationFields.id.optional(),
            content: z.string().min(2).max(50000).optional(),
        }).optional(),
        files: z.array(generalValidationFields.file).max(3).optional()
    }).superRefine((data, ctx) => {
        const convId = data.params?.conversationId || data.body?.conversationId;
        if (!convId) {
            ctx.addIssue({
                code: "custom",
                path: ["conversationId"],
                message: "conversationId is required"
            });
        }
        if (!data.body?.content && !data.files?.length) {
            ctx.addIssue({
                code: "custom",
                path: ["content"],
                message: "missing message content"
            });
        }
    });
};

export const getConversationMessages = (lang) => {
    return z.object({
        params: z.object({
            conversationId: generalValidationFields.id
        })
    });
};

export const deleteConversation = (lang) => {
    return z.object({
        params: z.object({
            conversationId: generalValidationFields.id
        })
    });
};

export const conversationParam = (lang) => {
    return z.object({
        params: z.object({
            conversationId: generalValidationFields.id
        })
    });
};
