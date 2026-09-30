import { z } from "zod";
import { generalValidationFields } from "../../common/validation.js";


export const loginSchema = z.strictObject({
    email: generalValidationFields.email,
    password: generalValidationFields.password
})


export const login = (lang) => {
    return z.object({
        body: loginSchema,
        query: z.strictObject({
            lang: z.string().length(2).optional()
        })
    });
};

// schema => validators.signup => signup() (signup auth valid meen byshawr 3leha validators.signup meen bystlmha schema)
export const signup = (lang) => {
    return z.object({
    body: loginSchema.extend({
        username: generalValidationFields.username(lang),
        phone: generalValidationFields.phone,
        confirmPassword: generalValidationFields.password,
        gender: generalValidationFields.gender,
    }).superRefine((data, ctx) => {
        generalValidationFields.matchFields({ original: "password", copy: "confirmPassword", data, ctx })
    })
})
}
