import { describe, expect, it } from "vitest";
import { normalizeEmail, passwordProblem, safeNextPath } from "@/lib/auth-rules";

describe("auth rules", () => {
  it("enforces the password policy", () => {
    expect(passwordProblem("short1")).toMatch(/at least 10/);
    expect(passwordProblem("onlyletterslong")).toMatch(/letter and one number/);
    expect(passwordProblem("12345678901")).toMatch(/letter and one number/);
    expect(passwordProblem("a1".repeat(40))).toMatch(/72/);
    expect(passwordProblem("correct horse 42")).toBeNull();
  });

  it("normalizes and validates email addresses", () => {
    expect(normalizeEmail("  Owner@Example.COM ")).toBe("owner@example.com");
    expect(normalizeEmail("nope")).toBeNull();
    expect(normalizeEmail(undefined)).toBeNull();
    expect(normalizeEmail(`${"a".repeat(260)}@x.com`)).toBeNull();
  });

  it("only allows same-site redirect targets after login", () => {
    expect(safeNextPath("/dashboard?tab=billing")).toBe("/dashboard?tab=billing");
    for (const bad of ["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", "/ok\r\nSet-Cookie: x=1", "", null, undefined, 42, "/".padEnd(300, "a")]) {
      expect(safeNextPath(bad)).toBe("/dashboard");
    }
  });
});
