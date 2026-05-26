import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { User } from "../models/user.model.js";
import { createUser } from "../modules/users/user.service.js";
import { AppError } from "../utils/appError.js";

vi.mock("../services/email.service.js", () => ({
  sendUserCredentialsEmail: vi.fn()
}));

import { sendUserCredentialsEmail } from "../services/email.service.js";

const sendUserCredentialsEmailMock = vi.mocked(sendUserCredentialsEmail);

describe("user.service createUser", () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), { autoIndex: true });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  beforeEach(async () => {
    sendUserCredentialsEmailMock.mockReset();
    await User.deleteMany({});
  });

  it("creates a managed user with a generated password and sends credentials", async () => {
    sendUserCredentialsEmailMock.mockResolvedValue({
      mode: "preview",
      recipient: "new.user@example.com",
      messageId: "preview-1"
    });

    const result = await createUser(
      {
        email: "new.user@example.com",
        role: "user",
        profile: {
          name: "New User",
          targetRole: "QA Engineer"
        }
      },
      "admin@example.com"
    );

    const storedUser = await User.findOne({ email: "new.user@example.com", isDeleted: false }).select("+passwordHash");

    expect(result.user.email).toBe("new.user@example.com");
    expect(result.credentialDelivery.mode).toBe("preview");
    expect(result.temporaryPassword).toHaveLength(18);
    expect(storedUser?.passwordHash).toBeTruthy();
    expect(await bcrypt.compare(result.temporaryPassword, storedUser?.passwordHash ?? "")).toBe(true);
    expect(sendUserCredentialsEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "new.user@example.com",
        temporaryPassword: result.temporaryPassword,
        loginUrl: expect.stringContaining("/login"),
        createdByEmail: "admin@example.com"
      })
    );
  });

  it("rolls back the user if the credential email fails", async () => {
    sendUserCredentialsEmailMock.mockRejectedValue(new AppError(500, "INTERNAL_ERROR", "Email failed"));

    await expect(
      createUser(
        {
          email: "rollback@example.com",
          role: "user",
          profile: {
            name: "Rollback User"
          }
        },
        "admin@example.com"
      )
    ).rejects.toMatchObject({ code: "INTERNAL_ERROR" });

    expect(await User.countDocuments({ email: "rollback@example.com", isDeleted: false })).toBe(0);
  });
});
