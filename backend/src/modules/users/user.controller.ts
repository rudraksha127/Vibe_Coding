import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getRequestUser } from "../../utils/requestUser.js";
import * as userService from "./user.service.js";

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const user = getRequestUser(req);
  sendSuccess(res, await userService.createUser(req.body, user.email), 201);
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = getRequestUser(req);
  sendSuccess(res, await userService.getMe(user.id));
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const user = getRequestUser(req);
  sendSuccess(res, await userService.updateMe(user.id, req.body));
});

export const exportMyData = asyncHandler(async (req: Request, res: Response) => {
  const user = getRequestUser(req);
  sendSuccess(res, await userService.exportMyData(user.id));
});

export const deleteMe = asyncHandler(async (req: Request, res: Response) => {
  const user = getRequestUser(req);
  await userService.deleteMe(user.id);
  sendSuccess(res, { ok: true });
});
