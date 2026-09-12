import { ConflictException, NotfoundException } from "../../common/exceptions/error.exception.js"
import { createOne, findOne } from "../../common/repository/index.js"
import { decryption, encryption } from "../../common/security/encryption.security.js"
import { hash , compare } from "../../common/security/hash.security.js"
import { UserModel } from "../../DB/model/user.model.js"
import bcrypt from "bcrypt"

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

export const login = async ({ email, password }) => {
    const account = await findOne({
        model: UserModel,
        filter: { email } //shelna pass 5las 3shan howa kda kda hashed fa hykarn eh
    })
    if (!account) throw NotfoundException("Invalid email or password")
    const match = await bcrypt.compare(password, account.password)
    if (!match) throw NotfoundException("Invalid email or password")
        account.phone = await decryption(account.phone)
    return account
}



