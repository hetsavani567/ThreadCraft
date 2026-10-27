import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "tc_default_access_secret_2026";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "tc_default_refresh_secret_2026";

export const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_EXPIRY || "15m";
export const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRY || "7d";

/**
 * Generate Access Token (short-lived)
 */
export const generateAccessToken = (payload) => {
    return jwt.sign(payload, JWT_ACCESS_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY
    });
};

/**
 * Generate Refresh Token (long-lived)
 */
export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY
    });
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, JWT_ACCESS_SECRET);
    } catch (err) {
        return null;
    }
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (err) {
        return null;
    }
};

/**
 * Hash a refresh token for safe storage in the database
 */
export const hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Generate unique session ID
 */
export const generateSessionId = () => {
    return "sess_" + crypto.randomBytes(24).toString("hex");
};

/**
 * Calculate expiration date from string like "7d", "15m", "1d"
 */
export const calculateExpiryDate = (expiryStr = "7d") => {
    const now = new Date();
    const match = expiryStr.match(/^(\d+)([smhd])$/);
    if (!match) {
        // default 7 days
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
    const val = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
        case "s": return new Date(now.getTime() + val * 1000);
        case "m": return new Date(now.getTime() + val * 60 * 1000);
        case "h": return new Date(now.getTime() + val * 60 * 60 * 1000);
        case "d": return new Date(now.getTime() + val * 24 * 60 * 60 * 1000);
        default: return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
};
