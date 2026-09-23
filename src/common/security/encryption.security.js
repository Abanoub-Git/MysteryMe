import crypto from "node:crypto";
import { ENC_KEY, IV_LENGTH } from "../../config.js";

export const encryption = async (plaintext) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", ENC_KEY, iv);
    let encryptData = cipher.update(plaintext, "utf-8", "hex");
    encryptData += cipher.final("hex");
    // console.log({ cipher, encryptData });/
    return `${iv.toString("hex")}:::${encryptData}`; //da kda m3na klmt bebo encrypted
};


export const decryption = async (cipherText) => {
    const [iv, encryptedData] = cipherText.split(":::");
    // console.log({ iv, encryptedData }); //ana kda tl3t iv w tl3t encryptedData 3shan a2dr ast5dmhom
    const iv_vector = Buffer.from(iv, "hex");
    // console.log({ iv_vector }); //ana kda tl3t iv buffered y3ny rg3 laslo a7wlo hexa
    const decipherVector = crypto.createDecipheriv("aes-256-cbc",ENC_KEY,iv_vector);
    let plaintext = decipherVector.update(encryptedData,"hex","utf8");
    plaintext += decipherVector.final("utf8");
    return plaintext;
}