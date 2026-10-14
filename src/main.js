import express from 'express'
import { authenticationController, conversationController, messageController, requestController, userController } from './modules/index.js'
import { globalErrorHandler } from './middleware/index.js'
import { PORT } from './config.js'
import { bootstrapDB } from './DB/connection.db.js'
import cors from "cors"
import helmet from 'helmet'
import morgan from 'morgan'
import { generateRateLimiter } from './common/utils/limiter.js'


const app = express()
await bootstrapDB(app, PORT)

const limiter = generateRateLimiter({limit:1000})
app.set("trust proxy", true);


app.use(
    morgan("combined"),
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
    cors({
        origin: [
        "https://mystery-me-eta.vercel.app",
        "http://localhost:5173",
        ],
        methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "ngrok-skip-browser-warning",
        ],
    }),
    limiter,
    express.json()
);

app.use("/assets", express.static("./assets"));


app.get('/', (req, res) => res.status(200).json({message: 'Hello World!'})) 

app.use("/auth", authenticationController) 
app.use("/conversation", conversationController)
app.use("/message", messageController)
app.use("/request", requestController)
app.use("/user", userController)

app.all('{/*dummy}', (req, res) => {return res.status(404).json({message: 'Route not found!'})})

app.use(globalErrorHandler)
