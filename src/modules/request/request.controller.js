import { Router } from "express";
import { successResponse } from "../../common/utils/index.js";
import { authentication } from "../../middleware/authentication.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from "./request.validation.js";
import {getIdentityRequestById,getReceivedIdentityRequests,getSentIdentityRequests,requestSenderIdentity,updateIdentityRequestStatus} from "./request.service.js";

const router = Router();

router.get("/received",authentication(),validation(validators.getIdentityRequests),async (req, res) => {
        const data = await getReceivedIdentityRequests(req.validate?.query,req.user);
        return successResponse({ res, data });
    }
);

router.get("/sent",authentication(),validation(validators.getIdentityRequests),async (req, res) => {
        const data = await getSentIdentityRequests(req.validate?.query,req.user);
        return successResponse({ res, data });
    }
);

router.get("/:requestId",authentication(),validation(validators.getRequestById),async (req, res) => {
        const requestId = req.validate?.params?.requestId;
        const data = await getIdentityRequestById({ requestId },req.user);
        return successResponse({ res, data });
    }
);


router.get( "/", authentication(),validation(validators.getIdentityRequests),async (req, res) => {
        const data = await getReceivedIdentityRequests(req.validate?.query,req.user);
        return successResponse({ res, data });
    }
);

router.patch("/:requestId/:decision",authentication(),validation(validators.updateRequestStatus),async (req, res) => {
        const requestId = req.validate?.params?.requestId;
        const status = req.validate?.params?.decision || req.validate?.body?.status || req.validate?.body?.action || req.validate?.body?.decision;
        const data = await updateIdentityRequestStatus({ requestId, status },req.user);
        return successResponse({ res, data });
    }
);

router.patch("/:requestId",authentication(),validation(validators.updateRequestStatus),async (req, res) => {
        const requestId = req.validate?.params?.requestId;
        const status = req.validate?.body?.status || req.validate?.body?.action || req.validate?.body?.decision;
        const data = await updateIdentityRequestStatus({ requestId, status },req.user);
        return successResponse({ res, data });
    }
);

router.post("/:messageId",authentication(),validation(validators.createIdentityRequest),async (req, res) => {
        const messageId = req.validate?.params?.messageId;
        const data = await requestSenderIdentity({ messageId },req.user);
        return successResponse({ res, status: 201, data });
    }
);

router.post("/",authentication(),validation(validators.createIdentityRequest),async (req, res) => {
        const messageId = req.validate?.params?.messageId || req.validate?.body?.messageId;
        const data = await requestSenderIdentity({ messageId },req.user);
        return successResponse({ res, status: 201, data });
    }
);

export default router;