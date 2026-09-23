import jwt from "jsonwebtoken"
import { ACCESS_ADMIN_TOKEN_SIGNATURE, ACCESS_TOKEN_EXPIRES_IN, ACCESS_USER_TOKEN_SIGNATURE, REFRESH_ADMIN_TOKEN_SIGNATURE, REFRESH_TOKEN_EXPIRES_IN, REFRESH_USER_TOKEN_SIGNATURE } from "../../config.js";
import { BadException, NotfoundException } from "../exceptions/error.exception.js";
import { findById } from "../repository/db.repository.js";
import { UserModel } from "../../DB/model/user.model.js";
import { TokenTypeEnum } from "../enum/security.enum.js";
import { RoleEnum } from "../enum/user.enum.js";

export const createToken = async ({
    payload = {},
    options = {},
    secret = ACCESS_USER_TOKEN_SIGNATURE
} = {}) => {
    return jwt.sign(payload, secret, options)
}


export const verifyToken = async ({
    token = "",
    secret = ACCESS_USER_TOKEN_SIGNATURE
} = {}) => {
    return jwt.verify(token, secret)
}



//bona2n 3alrole ali h2olo 3leh hyrg3li alaccess w alrefresh signature bto3 alrole da 
const getTokenSignatures = async ({ role = RoleEnum.USER } = {}) => {
    let signatures;
    switch (role) {
        case RoleEnum.ADMIN:
            signatures = { accessSignature: ACCESS_ADMIN_TOKEN_SIGNATURE, refreshSignature: REFRESH_ADMIN_TOKEN_SIGNATURE }
            break;
        default:
            signatures = { accessSignature: ACCESS_USER_TOKEN_SIGNATURE, refreshSignature: REFRESH_USER_TOKEN_SIGNATURE }
            break;
    }
    return signatures
}



//bona2n 3la no3 altoken hyrg3li alsignature ali ana 3aizha swa2 access aw refresh
const getSignature = async ({ tokenType = TokenTypeEnum.ACCESS  , role = RoleEnum.USER} = {}) => {
    const signatures = await getTokenSignatures({ role }) //eni ba3tlo role da hyfdne eni a5lih yrg3li access w refresh token
    return tokenType == TokenTypeEnum.ACCESS ? signatures.accessSignature : signatures.refreshSignature
}



export const decodeToken = async ({
    authorization = "",
    tokenType = TokenTypeEnum.ACCESS
} = {}) => {

    //bft7 sndo2 alezaz ana kda kda msh m7tag signature
    const decoded = jwt.decode(authorization) 
    console.log({ decoded })
    if (!decoded?.aud?.length) { //law mkntsh decoded aw? dec mlhash aud aw? aud mlhash length
        throw BadException("invalid token")
    }

    //awsl lno3 alaudiance ali m3aya 
    const payload = await verifyToken({ token: authorization , secret: await getSignature({ tokenType , role: decoded.aud[0] }) })
    if (!payload?.sub) {
        throw BadException("missing token payload")
    }

    //bona2n 3leh a2dr arg3 3ndi no3 alsignature ali ana 3aizha aw 3aiz ast5dmha w afok altoken
    const user = await findById({
        model: UserModel,
        id: payload.sub
    })
    if (!user) {
        throw NotfoundException("Invalid user")
    }
    return {user,payload}
}



//bta5od aluser w shwyt options zyada 3leh w y3mlo creation w bs kda  
export const createLoginCredentials = async ({
    user,
    issuer,
    options = {}
}) => {
    const { accessSignature, refreshSignature } = await getTokenSignatures({ role:user.role })
    const access_token = await createToken({
        payload:{sub:user._id},
        secret: accessSignature,
        options: {
            ...options,
            issuer,
            audience: [user.role],
            expiresIn: ACCESS_TOKEN_EXPIRES_IN
        }
    })

    const refresh_token = await createToken({
        payload:{sub:user._id},
        secret: refreshSignature,
        options: {
            ...options, //di extra options law 3aiza tdaf
            issuer,
            audience: [user.role],
            expiresIn: REFRESH_TOKEN_EXPIRES_IN
        }
    })

    return { access_token, refresh_token }
}
