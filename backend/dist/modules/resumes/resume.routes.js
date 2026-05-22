import { Router } from "express";
import multer from "multer";
import { env } from "../../config/env.js";
import { requireAuth } from "../../middleware/requireAuth.js";
import { validate } from "../../middleware/validate.js";
import { AppError } from "../../utils/appError.js";
import { createResumeBodySchema, listResumeQuerySchema, resumeParamsSchema, updateResumeBodySchema } from "./resume.schema.js";
import * as resumeController from "./resume.controller.js";
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: env.MAX_FILE_SIZE_MB * 1_024 * 1_024,
        files: 1
    },
    fileFilter: (_req, file, cb) => {
        const allowed = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];
        if (!allowed.includes(file.mimetype)) {
            cb(new AppError(400, "VALIDATION_ERROR", "Only PDF, DOC, or DOCX resumes are allowed"));
            return;
        }
        cb(null, true);
    }
});
export const resumeRouter = Router();
resumeRouter.use(requireAuth);
resumeRouter.post("/", upload.single("resume"), validate({ body: createResumeBodySchema }), resumeController.createResume);
resumeRouter.get("/", validate({ query: listResumeQuerySchema }), resumeController.listResumes);
resumeRouter.get("/:id", validate({ params: resumeParamsSchema }), resumeController.getResume);
resumeRouter.patch("/:id", validate({ params: resumeParamsSchema, body: updateResumeBodySchema }), resumeController.updateResume);
resumeRouter.post("/:id/analyze", validate({ params: resumeParamsSchema }), resumeController.analyzeResume);
resumeRouter.delete("/:id", validate({ params: resumeParamsSchema }), resumeController.deleteResume);
