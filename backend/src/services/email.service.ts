import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { AppError } from "../utils/appError.js";

type CredentialEmailInput = {
  email: string;
  name: string;
  temporaryPassword: string;
  loginUrl: string;
  createdByEmail: string;
};

export type CredentialDelivery = {
  mode: "smtp" | "preview";
  recipient: string;
  messageId: string;
};

type TransportOptions = Parameters<typeof nodemailer.createTransport>[0];

export async function sendUserCredentialsEmail(input: CredentialEmailInput): Promise<CredentialDelivery> {
  const { mode, transportOptions } = resolveTransport();
  const transporter = nodemailer.createTransport(transportOptions);
  const info = await transporter.sendMail({
    from: {
      name: env.SMTP_FROM_NAME,
      address: env.SMTP_FROM_EMAIL ?? "no-reply@interviewforge.local"
    },
    to: input.email,
    subject: "Your InterviewForge AI login details",
    text: [
      `Hello ${input.name},`,
      "",
      "Your InterviewForge AI account has been created.",
      `Login email: ${input.email}`,
      `Password: ${input.temporaryPassword}`,
      `Login URL: ${input.loginUrl}`,
      "",
      `Created by: ${input.createdByEmail}`
    ].join("\n")
  });

  return {
    mode,
    recipient: input.email,
    messageId: info.messageId
  };
}

function resolveTransport(): { mode: CredentialDelivery["mode"]; transportOptions: TransportOptions } {
  if (env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS && env.SMTP_FROM_EMAIL) {
    return {
      mode: "smtp",
      transportOptions: {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS
        }
      }
    };
  }

  if (env.NODE_ENV === "production") {
    throw new AppError(500, "INTERNAL_ERROR", "SMTP is not configured for credential emails");
  }

  return {
    mode: "preview",
    transportOptions: {
      jsonTransport: true
    }
  };
}
