import { Router } from "express";
import {
    register,
    login,
    getGoogleAuthUrl,
    googleAuthCallback,
    googleAuth,
    refreshTokens,
    logout,
    logoutAll,
    getMe,
    getActiveSessions,
    revokeSessionById
} from "../controllers/auth.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Public auth endpoints
router.post("/register", register);
router.post("/login", login);

// Google OAuth 2.0 permission consent endpoints
router.get("/google", getGoogleAuthUrl);
router.get("/google/url", getGoogleAuthUrl);
router.get("/google/callback", googleAuthCallback);
router.post("/google", googleAuth);

router.post("/refresh", refreshTokens);
router.post("/logout", logout);

// Protected session endpoints
router.get("/me", authenticateToken, getMe);
router.post("/logout-all", authenticateToken, logoutAll);
router.get("/sessions", authenticateToken, getActiveSessions);
router.delete("/sessions/:sessionId", authenticateToken, revokeSessionById);

export default router;
