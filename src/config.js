import { resolve } from 'node:path'
import { config } from 'dotenv'

const NODE_ENV = process.env.NODE_ENV ?? 'development'
config({ path: resolve(`.env.${NODE_ENV}`) })
export const PORT = parseInt(process.env.PORT ?? "9000")

export const DB_URI = process.env.DB_URI
export const ENC_KEY = process.env.ENC_KEY
export const IV_LENGTH = parseInt(process.env.IV_LENGTH ?? "16") //3shan yt2ri num msh string
