import { AppError } from "./appError.js";

const units: Record<string, number> = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000
};

export function parseDurationMs(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) {
    throw new AppError(500, "INTERNAL_ERROR", `Invalid duration: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = units[match[2] ?? ""];
  if (!unit) {
    throw new AppError(500, "INTERNAL_ERROR", `Invalid duration unit: ${value}`);
  }

  return amount * unit;
}

