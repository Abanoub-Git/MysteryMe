import { z } from 'zod';
import { generalValidationFields } from '../../common/validation.js';

export const createMessage = (lang) => {
    return z.object({
        body: z.strictObject({
            content: z.string().min(2).max(50000).optional(),
            receiverId: generalValidationFields.id,
        }),
        files: z.array(generalValidationFields.file).max(3).optional()
    }).superRefine((data, ctx) => {
        // console.log({data});
        if (!data.body.content && !data.files?.length) {
            ctx.addIssue({
                code: "custom",
                path: ["content"],
                message: "missing message content"
            });
        }
    })
};


export const allMessages = (lang) => {
    return z.object({
        query: z.strictObject({
            type: z.enum(["0", "1", "2"]).default("0"),
            // receiverId: generalValidationFields.id
            page: z.coerce.number().default(1),
            limit: z.coerce.number().default(5),
        })
    });
};



export const delMessage = (lang) => {
    return z.object({
        params: z.strictObject({
            messageId: generalValidationFields.id,
        }),
    });
};