import { describe, expect, it } from "vitest";

function scoreTone(score: number): "strong" | "steady" | "focus" {
  if (score >= 80) {
    return "strong";
  }
  if (score >= 60) {
    return "steady";
  }
  return "focus";
}

describe("scoreTone", () => {
  it("maps interview score ranges", () => {
    expect(scoreTone(91)).toBe("strong");
    expect(scoreTone(72)).toBe("steady");
    expect(scoreTone(45)).toBe("focus");
  });
});

