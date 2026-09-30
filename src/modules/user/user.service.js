import { findByIdAndUpdate } from "../../common/repository/db.repository.js"
import { UserModel } from "../../DB/model/user.model.js"
import { createLoginCredentials, createRevokeToken, userBaseRevokeTokenKey} from "../../common/security/token.security.js"
import { ConflictException } from "../../common/exceptions/error.exception.js"
import { ACCESS_TOKEN_EXPIRES_IN } from "../../config.js"
import { LogoutEnum } from "../../common/enum/security.enum.js"
import { del, keys } from "../../common/services/index.js"

export const profile = async (user) => {
    return user
}



export const update = async (user, data) => {
    const account = await findByIdAndUpdate({
        model: UserModel,
        id: user._id,
        update: data
    })
    return account
}


export const rotateToken = async (payload, user, issuer) => {
    const accessExpiresIn = (payload.iat + ACCESS_TOKEN_EXPIRES_IN) * 1000
    const currentTime = Date.now() + (30 * 60000)
    if (currentTime < accessExpiresIn) {
        throw ConflictException("Sorry we cannot create new login credentials while current access token still within valid time range")
    }
    const data = await createLoginCredentials({user,issuer}) 
    await createRevokeToken({payload,user})
    return data
}




export const logout = async (payload, user, { action = LogoutEnum.DEVICE } = {}) => {
    switch (action) {
        case LogoutEnum.ALL:
            user.changeCredentialsTime = new Date();
            await user.save();
            console.log({ k: await keys({ prefix: userBaseRevokeTokenKey({ userId: payload.sub }) }) });
            await del({ key: await keys({ prefix: userBaseRevokeTokenKey({ userId: payload.sub }) }) });
            break;
        default:
            await createRevokeToken({ payload , user });
            break;
    }
    return;
}
