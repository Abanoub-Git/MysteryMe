import {Router} from 'express';
import { successResponse } from '../../common/utils/index.js';
const router = Router();

router.get('/', (req, res) => {
    return successResponse({res})
})

export default router