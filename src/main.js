import express from 'express'
import { authenticationController, messageController, userController } from './modules/index.js'
import { globalErrorHandler } from './middleware/index.js'
import { PORT } from './config.js'
import { bootstrapDB } from './DB/connection.db.js'
import { encryption,decryption } from './common/security/encryption.security.js'
const app = express()
bootstrapDB(app, PORT)
app.use(express.json())
const encValue = await encryption("bebo")
const decValue = await decryption(encValue)
console.log({encValue, decValue})

app.get('/', (req, res) => res.status(200).json({message: 'Hello World!'})) 

app.use("/auth", authenticationController) //kda law 3aizo y5osh 3la auth hy5osh 3latol msh hy3di 3la kol almodules l7d ma yla2ih
app.use("/message", messageController)
app.use("/user", userController)

app.all('{/*dummy}', (req, res) => {return res.status(404).json({message: 'Route not found!'})})

app.use(globalErrorHandler)

