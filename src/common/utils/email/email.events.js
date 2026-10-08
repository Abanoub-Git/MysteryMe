import {EventEmitter} from "events"
import { sendEmail } from "./send.email.js"
import { verifyEmailTemplate } from "./email.template.js"

export const emailEvent = new EventEmitter()

emailEvent.on("sendEmail", async ({ recipients, subject, data }) => {
    await sendEmail({
        ...recipients, 
        subject,
        html: verifyEmailTemplate({ code: data.code, subject, title: data.title ?? subject })
    })
})