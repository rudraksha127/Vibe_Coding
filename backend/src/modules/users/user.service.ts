import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { env } from "../../config/env.js";
import { AuthSession } from "../../models/authSession.model.js";
import { InterviewSession } from "../../models/interviewSession.model.js";
import { Resume } from "../../models/resume.model.js";
import { User } from "../../models/user.model.js";
import type { CredentialDelivery } from "../../services/email.service.js";
import { sendUserCredentialsEmail } from "../../services/email.service.js";
import { AppError } from "../../utils/appError.js";
import { toSafeUser } from "../auth/auth.service.js";
import type { CreateUserInput, UpdateMeInput } from "./user.schema.js";

type CreateUserResult = {
  user: ReturnType<typeof toSafeUser>;
  temporaryPassword: string;
  credentialDelivery: CredentialDelivery;
};

export async function createUser(input: CreateUserInput, createdByEmail: string): Promise<CreateUserResult> {
  const existingUser = await User.findOne({ email: input.email, isDeleted: false });
  if (existingUser) {
    throw new AppError(409, "CONFLICT", "An account already exists for this email");
  }

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await bcrypt.hash(temporaryPassword, env.BCRYPT_COST);
  const user = await User.create({
    email: input.email,
    passwordHash,
    role: input.role,
    profile: {
      name: input.profile.name,
      targetRole: input.profile.targetRole ?? "",
      experienceLevel: input.profile.experienceLevel ?? "fresh_graduate",
      targetCompanies: input.profile.targetCompanies ?? [],
      preferredLanguage: input.profile.preferredLanguage ?? "en",
      timezone: input.profile.timezone ?? "UTC",
      dressCodePreference: input.profile.dressCodePreference ?? "business_casual",
      photoUrl: input.profile.photoUrl ?? ""
    },
    authProviders: [{ provider: "password", connectedAt: new Date() }]
  });

  try {
    const credentialDelivery = await sendUserCredentialsEmail({
      email: user.email,
      name: user.profile?.name || user.email,
      temporaryPassword,
      loginUrl: env.APP_LOGIN_URL,
      createdByEmail
    });

    return {
      user: toSafeUser(user),
      temporaryPassword,
      credentialDelivery
    };
  } catch (error) {
    await User.deleteOne({ _id: user._id });
    throw error;
  }
}

export async function getMe(userId: string) {
  const user = await User.findOne({ _id: userId, isDeleted: false });
  if (!user) {
    throw new AppError(404, "NOT_FOUND", "User not found");
  }

  return toSafeUser(user);
}

export async function updateMe(userId: string, input: UpdateMeInput) {
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

export async function exportMyData(userId: string) {
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

export async function deleteMe(userId: string): Promise<void> {
  const now = new Date();
  const result = await User.updateOne(
    { _id: userId, isDeleted: false },
    { $set: { isDeleted: true, deletedAt: now } }
  );

  if (result.matchedCount === 0) {
    throw new AppError(404, "NOT_FOUND", "User not found");
  }

  await Promise.all([
    AuthSession.updateMany({ userId, revokedAt: { $exists: false } }, { $set: { revokedAt: now } }),
    Resume.updateMany({ userId, isDeleted: false }, { $set: { isDeleted: true, deletedAt: now } }),
    InterviewSession.updateMany({ userId, isDeleted: false }, { $set: { isDeleted: true, deletedAt: now } })
  ]);
}

function generateTemporaryPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  return Array.from(crypto.randomBytes(18), (byte) => alphabet[byte % alphabet.length]).join("");
}
