import { createHash } from "node:crypto";

/**
 * Bunny Stream playback helpers.
 *
 * The video GUID and the token auth key never leave the server. When a paid
 * user hits play we mint a short-lived signed embed URL here and hand back only
 * that URL, so a leaked link is useless once it expires.
 */

const IFRAME_BASE = "https://iframe.mediadelivery.net/embed";

// How long a signed embed URL stays valid. Long enough to start playback,
// short enough that a copied link dies quickly.
const DEFAULT_TTL_SECONDS = 120;

function getConfig(): { libraryId: string; tokenAuthKey: string } {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
  const tokenAuthKey = process.env.BUNNY_STREAM_TOKEN_AUTH_KEY;

  if (!libraryId || !tokenAuthKey) {
    throw new Error(
      "Bunny Stream is not configured. Set BUNNY_STREAM_LIBRARY_ID and BUNNY_STREAM_TOKEN_AUTH_KEY."
    );
  }

  return { libraryId, tokenAuthKey };
}

/**
 * Build a signed, expiring embed URL for a Bunny Stream video.
 *
 * Bunny's embed token authentication signs the path with a SHA256 of
 * (tokenAuthKey + videoId + expires). Worth re-checking against Bunny's current
 * docs if playback ever 403s, since they have tweaked the formula before.
 */
export function buildSignedEmbedUrl(
  videoId: string,
  ttlSeconds: number = DEFAULT_TTL_SECONDS
): string {
  const { libraryId, tokenAuthKey } = getConfig();

  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const token = createHash("sha256")
    .update(tokenAuthKey + videoId + expires)
    .digest("hex");

  const params = new URLSearchParams({
    token,
    expires: String(expires),
    // Keep the player lean: no download button, autoplay off.
    autoplay: "false",
  });

  return `${IFRAME_BASE}/${libraryId}/${videoId}?${params.toString()}`;
}
