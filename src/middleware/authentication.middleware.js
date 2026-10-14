import { TokenTypeEnum } from "../common/enum/security.enum.js"
import { UnauthorizedException } from "../common/exceptions/error.exception.js"
import { decodeToken } from "../common/security/token.security.js"


export const bearerAuth = async ({req , tokenType = TokenTypeEnum.ACCESS}={}) => {
    const credential = req.headers["authorization"];
    const { user, payload } = await decodeToken({ authorization: credential , tokenType });
    req.user = user;
    req.payload = payload;
};


export const authentication = (tokenType = TokenTypeEnum.ACCESS) => {
    return async (req, res, next) => {
    const { authorization } = req.headers
    if (!authorization) {
        throw UnauthorizedException("Unauthorized Account")
    }
    await bearerAuth({req,tokenType})
    next()
}
} //ana kda balreturn estfdt eni momken a7ot param. 



export const authorization = (accessRole) => {
    return async (req, res, next) => {
        if (req.user.role < accessRole) {
            throw ForbiddenException("Forbidden Account")
        }
        next()
    }
}





