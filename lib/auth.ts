import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const SECRET = process.env.SESSION_SECRET ?? "pravega-dev-secret";
const COOKIE = "pravega_session";

export type Role = "student" | "officer" | "recruiter" | "admin";

export type Session = {
  userId: string;
  role: Role;
  name: string;
  tenantId: string;
};

function sign(payload: string) {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function serializeSession(session: Session): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function parseSession(raw: string | undefined): Session | null {
  if (!raw) return null;
  const [payload, mac] = raw.split(".");
  if (!payload || !mac) return null;
  const expected = sign(payload);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  return parseSession(jar.get(COOKIE)?.value);
}

export const SESSION_COOKIE = COOKIE;
export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 12,
};
