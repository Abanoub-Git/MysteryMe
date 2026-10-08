import {Router} from 'express';
import { successResponse } from '../../common/utils/index.js';
import { confirmEmail, confirmTwoStepVerification, disableTwoStepVerification, enableTwoStepVerification, login, loginConfirmation, LoginWithGmail, requestForgotPassword, resendConfirmEmail, resetPassword, signup, verifyForgotPassword } from './authentication.service.js';
import * as validators from './authentication.validation.js'
import { validation } from '../../middleware/validation.middleware.js';
import { authentication } from '../../middleware/authentication.middleware.js';

const router = Router();

router.post('/loginWithGmail',  async (req, res) => {
    try {
        const data = await LoginWithGmail(req.body,`${req.protocol}://${req.host}`)
        return successResponse({res, data, statusCode: 201})
    } catch (error) {
        console.error("Google Login Error:", error)
        return successResponse({res, data: error.message, statusCode: 400})
    }
})


router.post("/signup", validation(validators.signup) ,async (req, res, next) => {
    const data = await signup(req.validate.body)
    return successResponse({ res, status: 201, data })
})


router.patch("/confirm-email", validation(validators.confirmEmail) ,async (req, res, next) => {
    const data = await confirmEmail(req.body)
    return successResponse({ res, status: 200, data })
})


router.patch("/resend-confirm-email", validation(validators.resendConfirmEmail) ,async (req, res, next) => {
    const data = await resendConfirmEmail(req.body)
    return successResponse({ res, status: 200, data })
})



router.post("/request-confirm-password", validation(validators.resendConfirmEmail) ,async (req, res, next) => { //sbnaha resendConfirmEmail 3shan msh m7tagen n3ml validation gdid howa howa alcode bzbt
    const data = await requestForgotPassword(req.body)
    return successResponse({ res, status: 201, data })
})



router.post("/verify-forgot-password", validation(validators.confirmEmail) ,async (req, res, next) => {
    const data = await verifyForgotPassword(req.body)
    return successResponse({ res, status: 200, data })
})


router.patch("/reset-password", validation(validators.resetPassword) ,async (req, res, next) => {
    const data = await resetPassword(req.body)
    return successResponse({ res, status: 200, data })
})



router.post("/login",  validation(validators.login) , async (req, res, next) => {
    const data = await login(req.validate.body, `${req.protocol}://${req.host}`)
    return successResponse({ res, data })
})




router.post("/enable-2-step", authentication(), async (req, res, next) => {
    const data = await enableTwoStepVerification({ user: req.user })
    return successResponse({ res, data })
})


router.post("/login-confirmation",validation(validators.confirmTwoStepVerification),async (req, res, next) => {
    const data = await loginConfirmation(req.validate.body,`${req.protocol}://${req.host}`)
    return successResponse({ res, data })
})


router.patch("/confirm-2-step", authentication(), validation(validators.confirmTwoStepVerification), async (req, res, next) => {
    const data = await confirmTwoStepVerification({ user: req.user, email: req.validate.body.email, otp: req.validate.body.otp })
    return successResponse({res,data})
})



router.patch("/disable-2-step",authentication(),async (req, res, next) => {
    const data = await disableTwoStepVerification({user: req.user})
    return successResponse({res,data})
})



export default router