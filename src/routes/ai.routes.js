import { Router } from "express";
import {
    moderateContent,
    smartSearch,
    generateDescription,
} from "../controller/ai.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
    moderateContentSchema,
    smartSearchSchema,
    generateDescriptionSchema,
} from "../validation/ai.validation.js";

const router = Router();

// All AI routes require authentication
router.use(verifyJWT);

// POST /api/v1/ai/moderate — AI content moderation
router
    .route("/moderate")
    .post(validate({ body: moderateContentSchema }), moderateContent);

// POST /api/v1/ai/search — AI-powered natural language search
router
    .route("/search")
    .post(validate({ body: smartSearchSchema }), smartSearch);

// POST /api/v1/ai/generate-description — AI auto-description generator
router
    .route("/generate-description")
    .post(validate({ body: generateDescriptionSchema }), generateDescription);

export default router;
