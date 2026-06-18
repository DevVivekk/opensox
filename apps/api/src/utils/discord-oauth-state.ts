import crypto from "crypto";

const getStateSecret = (): string => {
  const secret =
    process.env.DISCORD_OAUTH_STATE_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "DISCORD_OAUTH_STATE_SECRET or JWT_SECRET must be configured"
    );
  }
  return secret;
};

export const createDiscordOAuthState = (userId: string): string => {
  const payload = JSON.stringify({
    userId,
    ts: Date.now(),
  });
  const payloadBase64 = Buffer.from(payload).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getStateSecret())
    .update(payloadBase64)
    .digest("base64url");
  return `${payloadBase64}.${signature}`;
};

export const verifyDiscordOAuthState = (
  state: string,
  maxAgeMs = 15 * 60 * 1000
): { userId: string } | null => {
  const [payloadBase64, signature] = state.split(".");
  if (!payloadBase64 || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", getStateSecret())
    .update(payloadBase64)
    .digest("base64url");

  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(payloadBase64, "base64url").toString("utf8")
    ) as { userId: string; ts: number };

    if (!payload.userId || !payload.ts) {
      return null;
    }

    if (Date.now() - payload.ts > maxAgeMs) {
      return null;
    }

    return { userId: payload.userId };
  } catch {
    return null;
  }
};
