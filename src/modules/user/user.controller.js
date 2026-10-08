import {Router} from 'express';
import { fileValidation, localFileUpload, successResponse} from '../../common/utils/index.js';
import { logout, profile, rotateToken, update } from './user.service.js';
import { authentication, authorization } from '../../middleware/authentication.middleware.js';
import { TokenTypeEnum } from '../../common/enum/security.enum.js';
import { RoleEnum } from '../../common/enum/user.enum.js';
import { uploadMiddleware } from '../../middleware/multer.middleware.js';
import { unlink } from 'fs/promises'
import { resolve } from 'path'
const router = Router();

router.get('/', authentication(), async (req, res) => {
    const data = await profile(req.user)
    return successResponse({res,data})
})


router.post("/logout", authentication(), async (req, res, next) => {
    const data = await logout(req.payload, req.user, req.body)
    return successResponse({ res, data })
})


router.patch("/", authentication(), authorization(RoleEnum.USER), async (req, res) => {
    const data = await update(req.user, req.body)
    return successResponse({res,data})
})


router.post("/rotate-token", authentication(TokenTypeEnum.REFRESH), async (req, res) => {
    const data = await rotateToken(req.payload, req.user, `${req.protocol}://${req.host}`)
    return successResponse({res,data})
})




router.patch(
    "/profile-image",
    authentication(),
    uploadMiddleware({
        multerMiddleware: localFileUpload({ maxFileSize: 3 }).single("attachment"),
        customPath: "users",
        validation: fileValidation.image
    }),
    async (req, res, next) => {
        const oldImage = req.user.image
        req.user.image = req.file.finalPath
        await req.user.save()
        if (oldImage && oldImage.startsWith("assets/")) {
            try {
                await unlink(resolve(`./${oldImage}`))
            } catch (error) {
                if (error.code !== "ENOENT") {
                    throw error
                }
            }
        }
        return successResponse({res,data: { user: req.user }})
    }
)


export default router