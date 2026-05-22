import { AuthSession } from "../../models/authSession.model.js";
import { InterviewSession } from "../../models/interviewSession.model.js";
import { Resume } from "../../models/resume.model.js";
import { User } from "../../models/user.model.js";
import { AppError } from "../../utils/appError.js";
import { toSafeUser } from "../auth/auth.service.js";
export async function getMe(userId) {
    const user = await User.findOne({ _id: userId, isDeleted: false });
    if (!user) {
        throw new AppError(404, "NOT_FOUND", "User not found");
    }
    return toSafeUser(user);
}
export async function updateMe(userId, input) {
    const user = await User.findOne({ _id: userId, isDeleted: false });
    if (!user) {
        throw new AppError(404, "NOT_FOUND", "User not found");
    }
    if (input.profile) {
        user.set("profile", {
            ...user.profile,
            ...input.profile
        });
    }
    if (input.privacyConsents) {
        user.set("privacyConsents", {
            ...user.privacyConsents,
            ...input.privacyConsents
        });
    }
    await user.save();
    return toSafeUser(user);
}
export async function exportMyData(userId) {
    const [user, resumes, interviews, activeSessions] = await Promise.all([
        User.findOne({ _id: userId, isDeleted: false }).lean(),
        Resume.find({ userId, isDeleted: false }).lean(),
        InterviewSession.find({ userId, isDeleted: false }).lean(),
        AuthSession.find({ userId, revokedAt: { $exists: false }, expiresAt: { $gt: new Date() } })
            .select("_id userAgent ipAddress expiresAt createdAt")
            .lean()
    ]);
    if (!user) {
        throw new AppError(404, "NOT_FOUND", "User not found");
    }
    return {
        exportedAt: new Date().toISOString(),
        user,
        resumes,
        interviews,
        activeSessions
    };
}
export async function deleteMe(userId) {
    const now = new Date();
    const result = await User.updateOne({ _id: userId, isDeleted: false }, { $set: { isDeleted: true, deletedAt: now } });
    if (result.matchedCount === 0) {
        throw new AppError(404, "NOT_FOUND", "User not found");
    }
    await Promise.all([
        AuthSession.updateMany({ userId, revokedAt: { $exists: false } }, { $set: { revokedAt: now } }),
        Resume.updateMany({ userId, isDeleted: false }, { $set: { isDeleted: true, deletedAt: now } }),
        InterviewSession.updateMany({ userId, isDeleted: false }, { $set: { isDeleted: true, deletedAt: now } })
    ]);
}
