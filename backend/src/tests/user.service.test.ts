import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { User } from "../models/user.model.js";
import { createUser } from "../modules/users/user.service.js";
import { AppError } from "../utils/appError.js";

vi.mock("../services/email.service.js", () => ({
  sendUserCredentialsEmail: vi.fn()
}));

import { sendUserCredentialsEmail } from "../services/email.service.js";

const sendUserCredentialsEmailMock = vi.mocked(sendUserCredentialsEmail);

describe("user.service createUser", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    sendUserCredentialsEmailMock.mockReset();
  });

  it("creates a managed user with a generated password and sends credentials", async () => {
    let createdPayload: Record<string, unknown> | undefined;

    vi.spyOn(User, "findOne").mockResolvedValue(null);
    vi.spyOn(User, "create").mockImplementation(async (payload) => {
      createdPayload = payload as Record<string, unknown>;
      return {
        _id: "user-1",
        id: "user-1",
        email: payload.email,
        role: payload.role,
        profile: payload.profile
      } as never;
    });

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

    expect(result.user.email).toBe("new.user@example.com");
    expect(result.credentialDelivery.mode).toBe("preview");
    expect(result.temporaryPassword).toHaveLength(18);
    expect(typeof createdPayload?.passwordHash).toBe("string");
    expect(await bcrypt.compare(result.temporaryPassword, String(createdPayload?.passwordHash ?? ""))).toBe(true);
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
    vi.spyOn(User, "findOne").mockResolvedValue(null);
    vi.spyOn(User, "create").mockResolvedValue({
      _id: "user-2",
      id: "user-2",
      email: "rollback@example.com",
      role: "user",
      profile: {
        name: "Rollback User"
      }
    } as never);
    const deleteSpy = vi.spyOn(User, "deleteOne").mockResolvedValue({
      acknowledged: true,
      deletedCount: 1
    } as never);
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

    expect(deleteSpy).toHaveBeenCalledWith({ _id: "user-2" });
  });
});
