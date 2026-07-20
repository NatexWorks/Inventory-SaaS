// Authentication helpers for password hashing, JWTs, and auth cookies.
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getToken } from "next-auth/jwt";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "./authConstants";

export { AUTH_COOKIE_NAME };

const FALLBACK_JWT_SECRET = "dev-inventory-secret-change-me";

// Reads the JWT secret from the environment with a safe development fallback.
function getJwtSecret() {
  const secret = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || FALLBACK_JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }
  return secret;
}

// Hashes a plain-text password before it is saved.
export function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

// Compares a plain password against a stored bcrypt hash.
export function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

// Signs the auth payload into a 7-day session token.
export function signToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

// Verifies and decodes an auth token, returning null when invalid.
export function verifyToken(token) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
    return null;
  }
}

// Reads the auth token from the incoming request cookies.
export function readTokenFromRequest(request) {
  return request.cookies?.get(AUTH_COOKIE_NAME)?.value || null;
}

// Reads the auth token from the server-side cookie store.
export function readTokenFromCookieStore() {
  return cookies().get(AUTH_COOKIE_NAME)?.value || null;
}

// Attaches the auth cookie to a response after login or signup.
export function applyAuthCookie(response, token) {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

// Extracts the authenticated user payload from either the NextAuth JWT or the legacy cookie during migration.
export async function getAuthenticatedUser(request) {
  let payload = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || getJwtSecret(),
  });

  // Keep the legacy JWT cookie working during the auth migration window.
  if (!payload?.sub) {
    const legacyToken = readTokenFromRequest(request);
    payload = legacyToken ? verifyToken(legacyToken) : null;
  }

  if (!payload?.sub) {
    return null;
  }

  return {
    userId: payload.userId || payload.sub,
    role: payload.role || "owner",
    payload,
  };
}

// Clears the auth cookie during logout.
export function clearAuthCookie(response) {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

// Creates the JWT payload from a user record.
export function createAuthPayload(user) {
  return {
    sub: String(user._id || user.id),
    userId: String(user.userId || user._id || user.id),
    role: user.role,
    email: user.email,
  };
}

// Checks whether an auth object has one of the allowed roles.
export function hasRole(auth, roles = []) {
  if (!auth) {
    return false;
  }

  if (!roles.length) {
    return true;
  }

  return roles.includes(auth.role);
}
