import { describe, expect, it } from "vitest";
import { contactSchema, emailSchema, firstNameSchema, messageSchema } from "./contact-validation";

const valid = {
  firstName: "Emerson",
  lastName: "Clamor",
  email: "emerson@example.com",
  message: "Hello there!",
};

describe("contactSchema", () => {
  it("accepts a complete message", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("reports every missing field", () => {
    const result = contactSchema.safeParse({ firstName: "", lastName: "", email: "", message: "" });
    expect(result.success).toBe(false);
    const fields = result.error?.issues.map((issue) => issue.path[0]);
    expect(new Set(fields)).toEqual(new Set(["firstName", "lastName", "email", "message"]));
  });
});

describe("field schemas", () => {
  it("allows letters, spaces, apostrophes, hyphens and ñ in names", () => {
    expect(firstNameSchema.safeParse("Niño O'Neil-Cruz").success).toBe(true);
  });

  it("rejects digits in names", () => {
    const result = firstNameSchema.safeParse("R2D2");
    expect(result.error?.issues[0].message).toBe("Only alphabetic characters allowed");
  });

  it("rejects malformed email addresses", () => {
    expect(emailSchema.safeParse("not-an-email").error?.issues[0].message).toBe("Invalid email address");
  });

  it("caps messages at 1000 words", () => {
    expect(messageSchema.safeParse(Array(1000).fill("word").join(" ")).success).toBe(true);
    expect(messageSchema.safeParse(Array(1001).fill("word").join(" ")).success).toBe(false);
  });
});
