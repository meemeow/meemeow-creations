import { beforeEach, describe, expect, it, vi } from "vitest";

const sendMail = vi.fn();

vi.mock("@/lib/send-mail", () => ({
  createTransporter: () => ({ sendMail }),
  mailFrom: () => "from@example.com",
  mailTo: () => "to@example.com",
}));

const { POST } = await import("./route");

const post = (body: unknown) =>
  POST(new Request("http://localhost/api/contact", { method: "POST", body: JSON.stringify(body) }));

const valid = {
  firstName: "Emerson",
  lastName: "Clamor",
  email: "emerson@example.com",
  message: "Hello there!",
};

describe("POST /api/contact", () => {
  beforeEach(() => {
    sendMail.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("sends the message and replies to the sender", async () => {
    const res = await post(valid);
    expect(res.status).toBe(200);
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "to@example.com",
        replyTo: "emerson@example.com",
        subject: "Portfolio contact: Emerson Clamor",
      }),
    );
  });

  it("rejects invalid input without sending", async () => {
    const res = await post({ ...valid, email: "nope" });
    expect(res.status).toBe(422);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("returns 500 when the mail server fails", async () => {
    sendMail.mockRejectedValueOnce(new Error("SMTP down"));
    const res = await post(valid);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "server_error" });
  });
});
