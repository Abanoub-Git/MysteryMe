import { BadException, ConflictException, NotfoundException, TooManyRequestsException } from "../../common/exceptions/error.exception.js"
import { createOne, findOne } from "../../common/repository/index.js"
import { decryption, encryption } from "../../common/security/encryption.security.js"
import { hash , compare } from "../../common/security/hash.security.js"
import { UserModel } from "../../DB/model/user.model.js"
import bcrypt from "bcrypt"
import { createLoginCredentials, userBaseRevokeTokenKey, userLoginTrailsKey } from "../../common/security/token.security.js"
import {OAuth2Client} from 'google-auth-library';
import { ProviderEnum, TwoStepVerificationEnum } from "../../common/enum/user.enum.js"
import { WEB_CLIENT_IDS } from "../../config.js"
import { emailEvent } from "../../common/utils/email/email.events.js"
import { EmailSubjectEnum } from "../../common/enum/email.enum.js"
import { createOtp } from "../../common/utils/otp.js"
import { del, expire, get, incrBy, keys, set, ttl } from "../../common/services/cache.service.js"
import { userEmailKey, userEmailTrailsKey } from "../../common/utils/index.js"

const client = new OAuth2Client();
async function verifyGoogleAccount(idToken) {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: WEB_CLIENT_IDS,
    });
    const payload = ticket.getPayload();
    if(!payload.email_verified){
        throw BadException("Email is not verified")
    }
    return payload
}



export const LoginWithGmail = async ({ idToken },issuer) => {
    console.log({ idToken });
    const {name,email,picture} = await verifyGoogleAccount(idToken)
    console.log({ name,email,picture }); //name email pic dol gbthom mn hna 
    const existAccount = await findOne({
        model: UserModel,
        filter: { email },
    })
    if(existAccount){
        if(existAccount.provider !== ProviderEnum.GOOGLE){
            throw ConflictException("invalid account provider")
        }
    } 
    const user = await createOne({      
        model: UserModel,
        data: {
            username: name,
            email,
            confirmEmail: new Date(),
            provider: ProviderEnum.GOOGLE,
            image: picture
        }
    })
    return await createLoginCredentials({user,issuer})
}



const sendEmailOtp = async ({email,subject,expiresIn=120,maxTrails=3, blockInSeconds=300,title}) => {
    const existOTP_TTL = await ttl({ key: userEmailKey({ email, subject }) })
    if (existOTP_TTL > 0) {
        throw ConflictException(`Sorry we cannot create new otp while existing one is still valid, please wait for ${existOTP_TTL} seconds`)
    }
    const oldTrails = await get({ key: userEmailTrailsKey({ email, subject }) }) ?? 0
    if (oldTrails >= maxTrails) {
        throw TooManyRequestsException(`Maximum resend attempts reached`)
    }
    const code = createOtp();
    await set({
        key: userEmailKey({ email, subject}),
        value: await hash(code.toString()), //alcode num becrypt msh bta5od ela string fa n7wlha
        ttl: expiresIn
    })
    const currentTrails = await incrBy({ key: userEmailTrailsKey({ email, subject }) }) //mezt incrBy eni arg3 mnha 3shan hya b3d ma btzwd btrg3 value bta3t altrails
    if(currentTrails === 3){
        await expire({ key: userEmailTrailsKey({ email, subject }), ttl: blockInSeconds })
    }
    emailEvent.emit("sendEmail", { recipients: { to: email }, subject, data: { code,title:title ?? subject } })
}



export const signup = async ({ email, password,phone, username }) => {
    const duplicatedAccount = await findOne({
        model: UserModel,
        filter: { email },
        options: { select: "email" }
    })
    if (duplicatedAccount) throw ConflictException("Email already exists") //wlaw 3aiz aktb mess gowa "email already exist"
    const account = await createOne({
        model: UserModel,
        data: { email, password: await hash(password),phone:await encryption(phone), username }
    })
    await sendEmailOtp({email,subject:EmailSubjectEnum.CONFIRM_EMAIL})
    return account
}



export const confirmEmail = async ({ otp, email }) => {
    const account = await findOne({
        model: UserModel,
        filter: { email, provider: ProviderEnum.SYSTEM, confirmEmail: { $exists: false } } //da 3shan law fe asln account confirmed abl kda msh hy3ml confirm tany
    })
    if (!account) throw NotfoundException("Invalid account")
    const hashOtp = await get({ key: userEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL }) })
    if (!hashOtp || !await compare(otp, hashOtp)) {
        throw ConflictException("Invalid OTP")
    }
    account.confirmEmail = new Date()
    await account.save()
    await del({ key: await keys({ prefix: userEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL }) }) }) //3shan myfdlsh memory f alredis mdam et3mlo activation nms7o
    return
}



export const resendConfirmEmail = async ({ email }) => {
    const account = await findOne({
        model: UserModel,
        filter: { email, provider: ProviderEnum.SYSTEM, confirmEmail: { $exists: false } } //da 3shan law fe asln account confirmed abl kda msh hy3ml confirm tany
    })
    if (!account) throw NotfoundException("Invalid account")
    await sendEmailOtp({email,subject:EmailSubjectEnum.CONFIRM_EMAIL})
    return
}



export const requestForgotPassword = async ({ email }) => {
    const account = await findOne({
        model: UserModel,
        filter: { email, provider: ProviderEnum.SYSTEM, confirmEmail: { $exists: true } } 
    })
    if (!account) throw NotfoundException("Invalid account")
    await sendEmailOtp({email,subject:EmailSubjectEnum.FORGOT_PASSWORD})
    return
}



export const verifyForgotPassword = async ({ otp, email }) => {
    const account = await findOne({
        model: UserModel,
        filter: { email, provider: ProviderEnum.SYSTEM, confirmEmail: { $exists: true } } 
    })
    if (!account) throw NotfoundException("Invalid account")
    const hashOtp = await get({ key: userEmailKey({ email, subject: EmailSubjectEnum.FORGOT_PASSWORD }) })
    if (!hashOtp || !await compare(otp, hashOtp)) {
        throw ConflictException("Invalid OTP")
    }
    return account
}



export const resetPassword = async ({ otp, email, password }) => {
    const account = await verifyForgotPassword({otp,email})
    account.password = await hash(password)
    account.changeCredentialsTime = new Date() 
    await account.save()
    const result = await Promise.all([ 
        keys ({prefix : userBaseRevokeTokenKey({userId: account._id})}),
        keys ({prefix : userEmailKey({email,subject:EmailSubjectEnum.FORGOT_PASSWORD})})
    ])
    await del ({key:[...result[0], ...result[1]]}) 
    return
}




export const login = async ({ email, password }, issuer) => {
    const account = await findOne({
        model: UserModel,
        filter: { email,provider: ProviderEnum.SYSTEM,confirmEmail: { $exists: true } }
    })
    if (!account) throw NotfoundException("Invalid email or password")
    const loginTrailsKey = userLoginTrailsKey({ email })
    const loginTrails = await get({ key: loginTrailsKey }) ?? 0
    if (loginTrails >= 5) {
        const remainingTime = await ttl({ key: loginTrailsKey })
        throw TooManyRequestsException(`Too many login attempts, please try again after ${remainingTime} seconds`)
    }
    const match = await bcrypt.compare(password, account.password)
    if (!match) {
        const currentTrails = await incrBy({ key: loginTrailsKey })
        if (currentTrails >= 5) {
            await expire({ key: loginTrailsKey, ttl: 5 * 60 })
            const remainingTime = await ttl({ key: loginTrailsKey })
            throw TooManyRequestsException(`Too many login attempts, please try again after ${remainingTime} seconds`)
        }
        throw NotfoundException("Invalid email or password")
    }
    await del({ key: loginTrailsKey })
    if (account.twoStepVerification === TwoStepVerificationEnum.ENABLED) {
        await sendEmailOtp({email: account.email,subject: EmailSubjectEnum.TWO_STEP_VERIFICATION})
        return {twoStepVerification: true,message: "Verification code sent to your email"}
    }
    return await createLoginCredentials({user: account,issuer})
}



export const enableTwoStepVerification = async ({ user }) => {
    if (user.twoStepVerification === TwoStepVerificationEnum.ENABLED) {
        throw ConflictException("Two-step verification is already enabled")
    }
    await sendEmailOtp({
        email: user.email,
        subject: EmailSubjectEnum.TWO_STEP_VERIFICATION
    })

    return
}


export const confirmTwoStepVerification = async ({ user, email, otp }) => {
    if (email !== user.email) {
        throw BadException("Invalid email")
    }
    if (user.twoStepVerification === TwoStepVerificationEnum.ENABLED) {
        throw ConflictException("Two-step verification is already enabled")
    }
    const hashOtp = await get({key: userEmailKey({email,subject: EmailSubjectEnum.TWO_STEP_VERIFICATION})})
    if (!hashOtp || !await compare(otp, hashOtp)) {
        throw ConflictException("Invalid OTP")
    }
    user.twoStepVerification = TwoStepVerificationEnum.ENABLED
    await user.save()
    await del({key: await keys({prefix: userEmailKey({email,subject: EmailSubjectEnum.TWO_STEP_VERIFICATION})})
    })
    return
}


export const loginConfirmation = async ({ email, otp }, issuer) => {
    const account = await findOne({
        model: UserModel,
        filter: { email, provider: ProviderEnum.SYSTEM, confirmEmail: { $exists: true }, twoStepVerification: TwoStepVerificationEnum.ENABLED }})
    if (!account) {
        throw NotfoundException("Invalid account")
    }
    const hashOtp = await get({key: userEmailKey({ email,subject: EmailSubjectEnum.TWO_STEP_VERIFICATION})})
    if (!hashOtp || !await compare(otp, hashOtp)) {
        throw ConflictException("Invalid OTP")
    }
    await del({key: await keys({prefix: userEmailKey({email,subject: EmailSubjectEnum.TWO_STEP_VERIFICATION})})})
    return await createLoginCredentials({user: account, issuer})
}


export const disableTwoStepVerification = async ({ user }) => {
    if (user.twoStepVerification === TwoStepVerificationEnum.DISABLED) {
        throw ConflictException("Two-step verification is already disabled")
    }
    user.twoStepVerification = TwoStepVerificationEnum.DISABLED
    await user.save()
    return
}