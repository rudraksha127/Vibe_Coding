import { sendSuccess } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getRequestUser } from "../../utils/requestUser.js";
import * as userService from "./user.service.js";
export const getMe = asyncHandler(async (req, res) => {
    const user = getRequestUser(req);
    sendSuccess(res, await userService.getMe(user.id));
});
export const updateMe = asyncHandler(async (req, res) => {
    const user = getRequestUser(req);
    sendSuccess(res, await userService.updateMe(user.id, req.body));
});
export const exportMyData = asyncHandler(async (req, res) => {
    const user = getRequestUser(req);
    sendSuccess(res, await userService.exportMyData(user.id));
});
export const deleteMe = asyncHandler(async (req, res) => {
    const user = getRequestUser(req);
    await userService.deleteMe(user.id);
    sendSuccess(res, { ok: true });
});
