import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { env } from "../../config/env.js";
import { AuthSession } from "../../models/authSession.model.js";
import { User } from "../../models/user.model.js";
import { AppError } from "../../utils/appError.js";
import { parseDurationMs } from "../../utils/duration.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";

const maxFailedAttempts = 5;
const lockoutMs = 15 * 60_000;

export type AuthContext = {
  userAgent?: string;
  ipAddress?: string;
};

export type SafeUser = {
  id: string;
  email: string;
  role: "user" | "admin";
  profile: {
    name: string;
    targetRole: string;
    experienceLevel: string;
    targetCompanies: string[];
    preferredLanguage: string;
    timezone: string;
    dressCodePreference: string;
    photoUrl: string;
  };
  privacyConsents: {
    recordingStorage: boolean;
    leaderboardVisible: boolean;
    marketingEmails: boolean;
  };
};

type SafeUserSource = {
  id: string;
  email: string;
  role: "user" | "admin";
  profile?: Partial<SafeUser["profile"]> | null;
  privacyConsents?: Partial<SafeUser["privacyConsents"]> | null;
};

export type AuthTokens = {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
  sessionId: string;
};

export async function register(input: RegisterInput, context: AuthContext): Promise<AuthTokens> {
  const existingUser = await User.findOne({ email: input.email, isDeleted: false });
  if (existingUser) {
    throw new AppError(409, "CONFLICT", "An account already exists for this email");
  }

  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_COST);
  const user = await User.create({
    email: input.email,
    passwordHash,
    profile: {
      name: input.profile.name,
      targetRole: input.profile.targetRole ?? "",
      experienceLevel: input.profile.experienceLevel ?? "fresh_graduate",
      targetCompanies: input.profile.targetCompanies ?? [],
      preferredLanguage: input.profile.preferredLanguage ?? "en",
      timezone: input.profile.timezone ?? "UTC",
      dressCodePreference: input.profile.dressCodePreference ?? "business_casual"
    },
    authProviders: [{ provider: "password", connectedAt: new Date() }]
  });

  return issueTokenPair(user.id, user.email, user.role, context);
}

export async function login(input: LoginInput, context: AuthContext): Promise<AuthTokens> {
  const user = await User.findOne({ email: input.email, isDeleted: false }).select("+passwordHash");
  if (!user || !user.passwordHash) {
    throw new AppError(401, "UNAUTHORIZED", "Invalid email or password");
  }

  if (user.lockUntil && user.lockUntil.getTime() > Date.now()) {
    throw new AppError(403, "FORBIDDEN", "Account temporarily locked. Please try again later.");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) {
    user.failedLoginAttempts = (user.failedLoginAttempts ?? 0) + 1;
    if (user.failedLoginAttempts >= maxFailedAttempts) {
      user.lockUntil = new Date(Date.now() + lockoutMs);
    }
    await user.save();
    throw new AppError(401, "UNAUTHORIZED", "Invalid email or password");
  }

  user.failedLoginAttempts = 0;
  user.set("lockUntil", undefined);
  await user.save();

  return issueTokenPair(user.id, user.email, user.role, context);
}

export async function refresh(refreshToken: string, context: AuthContext): Promise<AuthTokens> {
  const payload = verifyRefreshToken(refreshToken);
  const session = await AuthSession.findById(payload.sessionId);

  if (!session || session.expiresAt.getTime() <= Date.now()) {
    throw new AppError(401, "REFRESH_TOKEN_INVALID", "Invalid refresh token");
  }

  const tokenMatches = await bcrypt.compare(refreshToken, session.refreshTokenHash);
  if (!tokenMatches) {
    throw new AppError(401, "REFRESH_TOKEN_INVALID", "Invalid refresh token");
  }

  if (session.revokedAt) {
    await AuthSession.updateMany(
      { userId: session.userId, revokedAt: { $exists: false } },
      { $set: { revokedAt: new Date() } }
    );
    throw new AppError(401, "REFRESH_TOKEN_INVALID", "Refresh token was already used");
  }

  const user = await User.findOne({ _id: payload.sub, isDeleted: false });
  if (!user) {
    throw new AppError(401, "REFRESH_TOKEN_INVALID", "Invalid refresh token");
  }

  const tokens = await issueTokenPair(user.id, user.email, user.role, context);
  session.revokedAt = new Date();
  session.replacedBySessionId = new Types.ObjectId(tokens.sessionId);
  await session.save();

  return tokens;
}

export async function logout(userId: string, sessionId: string): Promise<void> {
  await AuthSession.updateOne(
    { _id: sessionId, userId, revokedAt: { $exists: false } },
    { $set: { revokedAt: new Date() } }
  );
}

export async function listSessions(userId: string) {
  return AuthSession.find({
    userId,
    expiresAt: { $gt: new Date() },
    revokedAt: { $exists: false }
  })
    .sort({ createdAt: -1 })
    .select("_id userAgent ipAddress expiresAt createdAt")
    .lean();
}

export async function revokeSession(userId: string, sessionId: string): Promise<void> {
  const result = await AuthSession.updateOne(
    { _id: sessionId, userId, revokedAt: { $exists: false } },
    { $set: { revokedAt: new Date() } }
  );

  if (result.matchedCount === 0) {
    throw new AppError(404, "NOT_FOUND", "Session not found");
  }
}

async function issueTokenPair(
  userId: string,
  email: string,
  role: "user" | "admin",
  context: AuthContext
): Promise<AuthTokens> {
  const refreshExpiresAt = new Date(Date.now() + parseDurationMs(env.JWT_REFRESH_EXPIRES_IN));
  const session = new AuthSession({
    userId,
    refreshTokenHash: "pending",
    expiresAt: refreshExpiresAt,
    ...(context.userAgent ? { userAgent: context.userAgent } : {}),
    ...(context.ipAddress ? { ipAddress: context.ipAddress } : {})
  });

  const refreshToken = signRefreshToken(userId, session.id);
  session.refreshTokenHash = await bcrypt.hash(refreshToken, env.BCRYPT_COST);
  await session.save();

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(401, "UNAUTHORIZED", "User no longer exists");
  }

  return {
    user: toSafeUser(user),
    accessToken: signAccessToken(userId, role, session.id),
    refreshToken,
    sessionId: session.id
  };
}

export function toSafeUser(user: SafeUserSource): SafeUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    profile: {
      name: user.profile?.name ?? "",
      targetRole: user.profile?.targetRole ?? "",
      experienceLevel: user.profile?.experienceLevel ?? "fresh_graduate",
      targetCompanies: user.profile?.targetCompanies ?? [],
      preferredLanguage: user.profile?.preferredLanguage ?? "en",
      timezone: user.profile?.timezone ?? "UTC",
      dressCodePreference: user.profile?.dressCodePreference ?? "business_casual",
      photoUrl: user.profile?.photoUrl ?? ""
    },
    privacyConsents: {
      recordingStorage: user.privacyConsents?.recordingStorage ?? false,
      leaderboardVisible: user.privacyConsents?.leaderboardVisible ?? false,
      marketingEmails: user.privacyConsents?.marketingEmails ?? false
    }
  };
}
