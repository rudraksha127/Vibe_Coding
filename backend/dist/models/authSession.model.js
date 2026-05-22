import { Schema, model } from "mongoose";
const authSessionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    refreshTokenHash: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        trim: true
    },
    ipAddress: {
        type: String,
        trim: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    revokedAt: {
        type: Date
    },
    replacedBySessionId: {
        type: Schema.Types.ObjectId,
        ref: "AuthSession"
    }
}, { timestamps: true });
authSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const AuthSession = model("AuthSession", authSessionSchema);
