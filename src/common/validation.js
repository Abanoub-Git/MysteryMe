import {z} from "zod"
import { GenderEnum } from "./enum/user.enum.js"
import { LangEnum } from "./enum/security.enum.js"
import mongoose from "mongoose"

//this compares between pass and confirm pass, email and confrim email  
const matchFields = ({ original, copy, data, ctx }) => {
    if (data[original] != data[copy]) {
        ctx.addIssue({
            code: "custom",
            path: [copy],
            message: `Fail to match between ${original} and ${copy}`
        })
    }
}


export const generalValidationFields = {
    email: z.email({message: "invalid email please try again"}),
    password: z.string().min(8).max(16),
    otp: z.string().length(6),
    username: z.string(),
    phone: z.e164(),
    confirmPassword: z.string().min(8).max(16),
    gender: z.enum(GenderEnum),
    id: z.string().refine((data) => mongoose.Types.ObjectId.isValid(data), { message: "Invalid Id" }),
    file: z.strictObject({
        fieldname: z.string(),
        originalname: z.string(),
        encoding: z.string(),
        mimetype: z.string(),
        buffer: z.instanceof(Buffer),
        size: z.number(),
        path: z.string()
    }),
    matchFields 
}