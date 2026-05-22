import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { validate } from "../../middleware/validate.js";
import { deleteMeBodySchema, updateMeBodySchema } from "./user.schema.js";
import * as userController from "./user.controller.js";

export const userRouter = Router();

userRouter.use(requireAuth);

userRouter.get("/me", userController.getMe);
userRouter.patch("/me", validate({ body: updateMeBodySchema }), userController.updateMe);
userRouter.get("/me/export", userController.exportMyData);
userRouter.delete("/me", validate({ body: deleteMeBodySchema }), userController.deleteMe);

