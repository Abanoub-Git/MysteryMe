import { BadException, ConflictException, NotfoundException } from "../../common/exceptions/error.exception.js"
import { createOne, findOne } from "../../common/repository/index.js"
import { decryption, encryption } from "../../common/security/encryption.security.js"
import { hash , compare } from "../../common/security/hash.security.js"
import { UserModel } from "../../DB/model/user.model.js"
import bcrypt from "bcrypt"
import { createLoginCredentials } from "../../common/security/token.security.js"
import {OAuth2Client} from 'google-auth-library';
import { ProviderEnum } from "../../common/enum/user.enum.js"
import { WEB_CLIENT_IDS } from "../../config.js"

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
    return account
}

export const login = async ({ email, password },issuer) => {
    const account = await findOne({
        model: UserModel,
        filter: { email } //shelna pass 5las 3shan howa kda kda hashed fa hykarn eh
    })
    if (!account) throw NotfoundException("Invalid email or password")
    const match = await bcrypt.compare(password, account.password)
    if (!match) throw NotfoundException("Invalid email or password")
        return await createLoginCredentials({user:account , issuer}) 
}



