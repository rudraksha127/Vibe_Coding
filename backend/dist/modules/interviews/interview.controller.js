import { sendSuccess } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getRequiredParam } from "../../utils/requestParam.js";
import { getRequestUser } from "../../utils/requestUser.js";
import * as interviewService from "./interview.service.js";
export const createInterviewSession = asyncHandler(async (req, res) => {
    const user = getRequestUser(req);
    const session = await interviewService.createInterviewSession(user.id, req.body);
    sendSuccess(res, session, 201);
});
export const listInterviewSessions = asyncHandler(async (req, res) => {
    const user = getRequestUser(req);
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const result = await interviewService.listInterviewSessions(user.id, page, limit, status);
    sendSuccess(res, result.data, 200, result.pagination);
});
export const getInterviewSession = asyncHandler(async (req, res) => {
    const user = getRequestUser(req);
    sendSuccess(res, await interviewService.getInterviewSession(user.id, getRequiredParam(req, "id")));
});
export const generateQuestion = asyncHandler(async (req, res) => {
    const user = getRequestUser(req);
    const question = await interviewService.generateQuestion(user.id, getRequiredParam(req, "id"), req.body);
    sendSuccess(res, question, 201);
});
export const submitAnswer = asyncHandler(async (req, res) => {
    const user = getRequestUser(req);
    const result = await interviewService.submitAnswer(user.id, getRequiredParam(req, "id"), getRequiredParam(req, "questionId"), req.body);
    sendSuccess(res, result, 201);
});
export const completeInterviewSession = asyncHandler(async (req, res) => {
    const user = getRequestUser(req);
    const scorecard = await interviewService.completeInterviewSession(user.id, getRequiredParam(req, "id"));
    sendSuccess(res, scorecard);
});
export const deleteInterviewSession = asyncHandler(async (req, res) => {
    const user = getRequestUser(req);
    await interviewService.deleteInterviewSession(user.id, getRequiredParam(req, "id"));
    sendSuccess(res, { ok: true });
});
