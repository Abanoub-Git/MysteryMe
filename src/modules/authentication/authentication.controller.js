import {Router} from 'express';
import { successResponse } from '../../common/utils/index.js';
import { login, signup } from './authentication.service.js';
const router = Router();

router.post('/signup',  async (req, res) => {
    try {
        const data = await signup(req.body)
        return successResponse({res, data, statusCode: 201})
    } catch (error) {
        return successResponse({res, data: error.message, statusCode: 400})
    }
})


router.post('/login', async (req, res) => {
    try {
        const data = await login(req.body)
        return successResponse({res, data})
    } catch (error) {
        return successResponse({res, data: error.message, statusCode: 400})
    }
})

export default router




