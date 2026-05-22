import { type HydratedDocument, type Model, Types } from "mongoose";
import { AppError } from "./appError.js";

type OwnedDocument = {
  userId: Types.ObjectId;
  isDeleted?: boolean;
};

export async function assertOwnership<T extends OwnedDocument>(
  model: Model<T>,
  resourceId: string,
  userId: string,
  includeDeleted = false
): Promise<HydratedDocument<T>> {
  if (!Types.ObjectId.isValid(resourceId)) {
    throw new AppError(404, "NOT_FOUND", "Resource not found");
  }

  const filter: Record<string, unknown> = {
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
