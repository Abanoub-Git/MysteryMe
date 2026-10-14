import {Router} from 'express';
import { fileValidation, localFileUpload, successResponse } from '../../common/utils/index.js';
import { createMessage, deleteMessage, getAllMessages, getMessage, markMessageAsRead } from './message.service.js';
import { uploadMiddleware } from './../../middleware/multer.middleware.js';
import {validation} from '../../middleware/validation.middleware.js'
import * as validators from './message.validation.js'
import { authentication, bearerAuth } from '../../middleware/authentication.middleware.js';

const router = Router();
const messageFolderName = "messages"



//kda y2dr yb3t swa2 howa auth aw l2 
router.post(
    '/',
    async (req,res,next)=>{
        if(req.headers['authorization']){
            await bearerAuth({req})
        }
        next()
    },
    uploadMiddleware({
        multerMiddleware:localFileUpload().any("attachments", 3),
        validation: fileValidation.image,
        customPath: messageFolderName,
        isRequired: false
    }),
    validation(validators.createMessage),
    async (req, res, next) => {
        // console.log(req.files)//ab3t req 3shan ashof shkl alkeys bta3t alfiles w a7otha f alvalidation mess
        const data = await createMessage(req.body, req.files, req.user);
        return successResponse({ res, status: 201, data });
    }
);




router.get("/",authentication(), validation(validators.allMessages), async (req, res, next) => {
        const data = await getAllMessages(req.validate.query,req.user);
        return successResponse({ res, data });
    }
);


router.get("/:messageId",authentication(),validation(validators.delMessage),async (req, res, next) => {
        const data = await getMessage(req.validate.params, req.user);
        return successResponse({ res, data });
    }
);

router.patch("/:messageId/read", authentication(), validation(validators.delMessage), async (req, res, next) => {
        const data = await markMessageAsRead(req.validate.params, req.user);
        return successResponse({ res, data });
    }
);


router.delete("/:messageId",authentication(),validation(validators.delMessage),async (req, res, next) => {
        const data = await deleteMessage(req.validate.params, req.user);
        return successResponse({ res, data });
    }
);



export default router


