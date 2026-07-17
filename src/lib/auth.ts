import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "agromil-super-secret-key-2026";
const TOKEN_EXPIRY = "24h";

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
  role: string;
}

/**
  Generates a JWT token for the user session.
 */
export function generateToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
  Verifies a JWT token. Returns the payload or null if invalid.
 */
export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch (error) {
    console.warn("JWT token verification failed:", error);
    return null;
  }
}
