import { LangEnum } from "../common/enum/security.enum.js"
import { BadException } from "../common/exceptions/error.exception.js"

export const validation = (schema) => {
    return (req, res, next) => {
        const lang = Number(req.headers['accept-language'] ?? LangEnum.EN)
        const validationResult = schema(lang).safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
        })
        if (!validationResult.success) {
            throw BadException("Validation Error", validationResult.error.issues)
        }
        req.validate = validationResult.data
        next()
    }
}


