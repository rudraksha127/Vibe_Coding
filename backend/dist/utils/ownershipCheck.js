import { Types } from "mongoose";
import { AppError } from "./appError.js";
export async function assertOwnership(model, resourceId, userId, includeDeleted = false) {
    if (!Types.ObjectId.isValid(resourceId)) {
        throw new AppError(404, "NOT_FOUND", "Resource not found");
    }
    const filter = {
        _id: new Types.ObjectId(resourceId),
        userId: new Types.ObjectId(userId),
        ...(includeDeleted ? {} : { isDeleted: false })
    };
    const doc = await model.findOne(filter);
    if (!doc) {
        throw new AppError(404, "NOT_FOUND", "Resource not found");
    }
    return doc;
}
