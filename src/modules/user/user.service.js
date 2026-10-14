import { findByIdAndUpdate } from "../../common/repository/user.repository.js"
import { createLoginCredentials, createRevokeToken, userBaseRevokeTokenKey} from "../../common/security/token.security.js"
import { ConflictException } from "../../common/exceptions/error.exception.js"
import { ACCESS_TOKEN_EXPIRES_IN } from "../../config.js"
import { LogoutEnum } from "../../common/enum/security.enum.js"
import { del, keys } from "../../common/services/index.js"
import { decryption, encryption } from "../../common/security/encryption.security.js"


export const profile = async (user) => {
    if (!user) return user;
    const userObj = user.toObject ? user.toObject() : { ...user };
    if (userObj.phone && typeof userObj.phone === "string" && userObj.phone.includes(":::")) {
        try {
            userObj.phone = await decryption(userObj.phone);
        } catch {
            // Keep original if decrypt fails
        }
    }
    return userObj;
}



export const update = async (user, data) => {
    const updateData = { ...data };
    if (updateData.username && typeof updateData.username === "string") {
        const parts = updateData.username.trim().split(" ");
        updateData.firstName = parts[0] || user.firstName;
        updateData.lastName = parts.slice(1).join(" ") || user.lastName;
        delete updateData.username;
    }
    if (updateData.phone && typeof updateData.phone === "string" && !updateData.phone.includes(":::")) {
        updateData.phone = await encryption(updateData.phone);
    }
    const account = await findByIdAndUpdate({
        id: user._id,
        update: updateData
    });
    return await profile(account);
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
            // console.log({ k: await keys({ prefix: userBaseRevokeTokenKey({ userId: payload.sub }) }) });
            await del({ key: await keys({ prefix: userBaseRevokeTokenKey({ userId: payload.sub }) }) });
            break;
        default:
            await createRevokeToken({ payload , user });
            break;
    }
    return;
}
