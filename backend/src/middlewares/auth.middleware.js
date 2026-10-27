import { verifyAccessToken } from "../utils/token.util.js";
import * as sessionModel from "../models/session.model.js";

/**
 * Middleware to authenticate API requests via Bearer Access Token
 * and verify the session is active in the database.
 */
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"] || req.headers["Authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Authentication token required."
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = verifyAccessToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                code: "TOKEN_EXPIRED",
                message: "Access token is invalid or has expired. Please refresh token."
            });
        }

        // Validate session in database
        if (decoded.sessionId) {
            const session = await sessionModel.findSessionById(decoded.sessionId);
            if (!session) {
                return res.status(401).json({
                    success: false,
                    code: "SESSION_NOT_FOUND",
                    message: "Session not found. Please log in again."
                });
            }

            if (session.is_revoked) {
                return res.status(401).json({
                    success: false,
                    code: "SESSION_REVOKED",
                    message: "Session has been revoked or logged out from another device."
                });
            }

            if (new Date(session.expires_at) < new Date()) {
                return res.status(401).json({
                    success: false,
                    code: "SESSION_EXPIRED",
                    message: "Session has expired. Please log in again."
                });
            }
        }

        req.user = decoded;
        req.sessionId = decoded.sessionId;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(500).json({
            success: false,
            message: "Authentication validation error",
            error: error.message
        });
    }
};

/**
 * Role-based authorization middleware
 * Example: requireRole('employee', 'Branch Manager')
 */
export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const userRole = req.user.role || req.user.userType;
        const empRole = req.user.emp_role;

        const isAllowed = allowedRoles.some(
            (role) =>
                role.toLowerCase() === userRole?.toLowerCase() ||
                (empRole && role.toLowerCase() === empRole?.toLowerCase())
        );

        if (!isAllowed) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Insufficient permissions."
            });
        }

        next();
    };
};

/**
 * Optional authentication: attach user if token present and valid, but continue regardless
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"] || req.headers["Authorization"];
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            const decoded = verifyAccessToken(token);
            if (decoded) {
                req.user = decoded;
                req.sessionId = decoded.sessionId;
            }
        }
    } catch {
        // Ignore errors in optional auth
    }
    next();
};
