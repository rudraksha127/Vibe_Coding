import { sendSuccess } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getRequiredParam } from "../../utils/requestParam.js";
import { getRequestUser } from "../../utils/requestUser.js";
import * as resumeService from "./resume.service.js";
export const createResume = asyncHandler(async (req, res) => {
    const user = getRequestUser(req);
    const resume = await resumeService.createResume(user.id, req.body, req.file);
    sendSuccess(res, resume, 201);
});
export const listResumes = asyncHandler(async (req, res) => {
    const user = getRequestUser(req);
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const result = await resumeService.listResumes(user.id, page, limit);
    sendSuccess(res, result.data, 200, result.pagination);
});
export const getResume = asyncHandler(async (req, res) => {
    const user = getRequestUser(req);
    sendSuccess(res, await resumeService.getResume(user.id, getRequiredParam(req, "id")));
});
export const updateResume = asyncHandler(async (req, res) => {
    const user = getRequestUser(req);
    sendSuccess(res, await resumeService.updateResume(user.id, getRequiredParam(req, "id"), req.body));
});
export const analyzeResume = asyncHandler(async (req, res) => {
    const user = getRequestUser(req);
    sendSuccess(res, await resumeService.analyzeResume(user.id, getRequiredParam(req, "id")));
});
export const deleteResume = asyncHandler(async (req, res) => {
    const user = getRequestUser(req);
    await resumeService.deleteResume(user.id, getRequiredParam(req, "id"));
    sendSuccess(res, { ok: true });
});
