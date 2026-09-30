import {z} from "zod"
import { GenderEnum } from "./enum/user.enum.js"
import { LangEnum } from "./enum/security.enum.js"


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
    password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/,{error: "invalid password please try again"}).min(8).max(16),
    username: (lang) => z.string().min(2, {message:lang == LangEnum.AR ? "عفواً لا يمكنك إدخال اسم مستخدم أقل من حرفين" : "min length is 2 char"}),
    phone: z.e164(),
    confirmPassword: z.string().min(8).max(16),
    gender: z.enum(GenderEnum),
    matchFields 
}