import { Schema, model } from "mongoose";
const resumeSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    title: {
        type: String,
        trim: true,
        default: "Primary resume"
    },
    originalFileName: {
        type: String,
        trim: true
    },
    mimeType: {
        type: String,
        trim: true
    },
    fileSizeBytes: {
        type: Number
    },
    storageKey: {
        type: String,
        trim: true
    },
    extractedText: {
        type: String,
        default: ""
    },
    parsed: {
        skills: [{ type: String, trim: true }],
        experience: [{ type: String, trim: true }],
        projects: [{ type: String, trim: true }],
        education: [{ type: String, trim: true }],
        certifications: [{ type: String, trim: true }],
        leadershipSignals: [{ type: String, trim: true }],
        gaps: [{ type: String, trim: true }]
    },
    atsScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    suggestions: [{ type: String, trim: true }],
    isPrimary: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    },
    deletedAt: {
        type: Date
    }
}, { timestamps: true });
resumeSchema.index({ userId: 1, isPrimary: 1 });
export const Resume = model("Resume", resumeSchema);
