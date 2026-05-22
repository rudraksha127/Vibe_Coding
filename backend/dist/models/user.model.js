import { Schema, model } from "mongoose";
export const experienceLevels = ["fresh_graduate", "junior", "mid", "senior", "staff", "principal"];
export const dressCodePreferences = ["business_formal", "business_casual", "smart_casual"];
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        select: false
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
        required: true
    },
    profile: {
        name: { type: String, trim: true, default: "" },
        targetRole: { type: String, trim: true, default: "" },
        experienceLevel: { type: String, enum: experienceLevels, default: "fresh_graduate" },
        targetCompanies: [{ type: String, trim: true }],
        preferredLanguage: { type: String, trim: true, default: "en" },
        timezone: { type: String, trim: true, default: "UTC" },
        dressCodePreference: { type: String, enum: dressCodePreferences, default: "business_casual" },
        photoUrl: { type: String, trim: true, default: "" }
    },
    authProviders: [
        {
            provider: { type: String, enum: ["password", "google", "github", "linkedin"], required: true },
            providerUserId: { type: String, trim: true },
            connectedAt: { type: Date, default: Date.now }
        }
    ],
    privacyConsents: {
        recordingStorage: { type: Boolean, default: false },
        leaderboardVisible: { type: Boolean, default: false },
        marketingEmails: { type: Boolean, default: false }
    },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date }
}, { timestamps: true });
userSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
export const User = model("User", userSchema);
