import { z } from "zod";
import { generalValidationFields } from "../../common/validation.js";
import { RequestStatusEnum } from "../../common/enum/request.enum.js";

export const createIdentityRequest = (lang) => {
    return z.object({
        params: z.object({
            messageId: generalValidationFields.id.optional()
        }).optional(),
        body: z.object({
            messageId: generalValidationFields.id.optional()
        }).optional()
    }).superRefine((data, ctx) => {
        if (!data.params?.messageId && !data.body?.messageId) {
            ctx.addIssue({
                code: "custom",
                path: ["messageId"],
                message: "messageId is required"
            });
        }
    });
};

export const getIdentityRequests = (lang) => {
    return z.object({
        query: z.object({
            page: z.coerce.number().default(1),
            limit: z.coerce.number().default(5),
        }).optional()
    });
};

export const updateRequestStatus = (lang) => {
    return z.object({
        params: z.object({
            requestId: generalValidationFields.id,
            decision: z.enum(["accept", "reject", "accepted", "rejected"]).optional()
        }),
        body: z.object({
            status: z.enum([RequestStatusEnum.ACCEPTED, RequestStatusEnum.REJECTED]).optional(),
            action: z.enum(["accept", "reject", "accepted", "rejected"]).optional(),
            decision: z.enum(["accept", "reject", "accepted", "rejected"]).optional()
        }).optional()
    }).superRefine((data, ctx) => {
        const val = data.params?.decision || data.body?.status || data.body?.action || data.body?.decision;
        if (!val) {
            ctx.addIssue({
                code: "custom",
                path: ["status"],
                message: "status ('accepted' or 'rejected') is required"
            });
        }
    });
};

export const getRequestById = (lang) => {
    return z.object({
        params: z.object({
            requestId: generalValidationFields.id
        })
    });
};
