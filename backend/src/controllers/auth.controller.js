import { OAuth2Client } from "google-auth-library";
import * as authModel from "../models/auth.model.js";
import * as sessionModel from "../models/session.model.js";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    hashToken,
    generateSessionId,
    calculateExpiryDate,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY
} from "../utils/token.util.js";
import { parseDeviceInfo, getClientIp } from "../utils/device.util.js";

const getOAuth2Client = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID?.replace(/^["']|["']$/g, "").trim();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.replace(/^["']|["']$/g, "").trim();
    const callbackUrl = (process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback").replace(/^["']|["']$/g, "").trim();

    return new OAuth2Client(clientId, clientSecret, callbackUrl);
};

/**
 * Helper to set secure refresh token cookie
 */
const setRefreshTokenCookie = (res, refreshToken) => {
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction, // Set to true in HTTPS production
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
};

/**
 * Register a new customer or employee
 */
export const register = async (req, res) => {
    try {
        const { name, email, password, mobile, role = "customer", house_no, street, area, city, state, pincode, branch_id } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const cleanMobile = mobile ? String(mobile).replace(/\D/g, "") : "";
        const isEmployee = normalizedEmail.endsWith("@thread.com") || role === "employee";

        // 1. Check if email already exists across customer or employee tables
        const existingEmpEmail = await authModel.findEmployeeByEmail(normalizedEmail);
        const existingCustEmail = await authModel.findCustomerByEmail(normalizedEmail);

        if (existingEmpEmail || existingCustEmail) {
            return res.status(409).json({
                success: false,
                field: "email",
                message: "This email address is already registered. Please sign in or use another email."
            });
        }

        // 2. Check if mobile number already exists across customer or employee tables
        if (cleanMobile) {
            const existingCustMobile = await authModel.findCustomerByMobile(cleanMobile);
            const existingEmpMobile = await authModel.findEmployeeByMobile(cleanMobile);

            if (existingCustMobile || existingEmpMobile) {
                return res.status(409).json({
                    success: false,
                    field: "mobile",
                    message: "This mobile number is already registered with another account. Please use another mobile number."
                });
            }
        }

        // Create user
        let user;
        let userId;
        let userType;

        if (isEmployee) {
            user = await authModel.createEmployee({
                emp_name: name,
                emp_email: normalizedEmail,
                password,
                mobile,
                emp_role: req.body.emp_role || "Sales Associate",
                branch_id: branch_id || 1
            });
            userId = user.emp_id;
            userType = "employee";
        } else {
            user = await authModel.createCustomer({
                name,
                email: normalizedEmail,
                password,
                mobile_no: mobile,
                house_no,
                street,
                area,
                city,
                state,
                pincode
            });
            userId = user.cust_id;
            userType = "customer";
        }

        // Create Session & Tokens
        const sessionId = generateSessionId();
        const expiresAt = calculateExpiryDate(REFRESH_TOKEN_EXPIRY);
        const deviceInfo = parseDeviceInfo(req);
        const ipAddress = getClientIp(req);
        const userAgent = req.headers["user-agent"] || "";

        const tokenPayload = {
            userId,
            email: normalizedEmail,
            role: userType === "employee" ? (user.emp_role || "employee") : "customer",
            userType,
            sessionId
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken({ userId, userType, sessionId });
        const refreshTokenHash = hashToken(refreshToken);

        // Store session in database
        await sessionModel.createSession({
            sessionId,
            userId,
            userType,
            refreshTokenHash,
            ipAddress,
            userAgent,
            deviceInfo,
            expiresAt
        });

        setRefreshTokenCookie(res, refreshToken);

        res.status(201).json({
            success: true,
            message: "Registration successful",
            user: {
                ...user,
                role: userType === "employee" ? "employee" : "customer"
            },
            accessToken,
            refreshToken,
            sessionId,
            expiresIn: ACCESS_TOKEN_EXPIRY
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ success: false, message: "Registration failed", error: error.message });
    }
};

/**
 * Standard Email & Password Login
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();

        let user = null;
        let userType = "customer";
        let userId = null;

        // 1. Check if user is an employee
        const emp = await authModel.findEmployeeByEmail(normalizedEmail);
        if (emp) {
            const isMatch = await authModel.verifyPassword(password, emp.password_hash);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: "Invalid email or password" });
            }
            user = {
                emp_id: emp.emp_id,
                name: emp.emp_name,
                email: emp.emp_email,
                role: "employee",
                emp_role: emp.emp_role,
                mobile: emp.mobile,
                salary: emp.salary,
                join_date: emp.join_date,
                emp_status: emp.emp_status,
                branch_id: emp.branch_id,
                branch_name: emp.branch_name,
                avatar_url: emp.avatar_url
            };
            userId = emp.emp_id;
            userType = "employee";
        } else {
            // 2. Check if user is a customer
            const cust = await authModel.findCustomerByEmail(normalizedEmail);
            if (!cust) {
                return res.status(401).json({ success: false, message: "Account not found with this email" });
            }
            const isMatch = await authModel.verifyPassword(password, cust.password_hash);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: "Invalid email or password" });
            }
            user = {
                cust_id: cust.cust_id,
                name: cust.name,
                email: cust.email,
                role: "customer",
                avatar_url: cust.avatar_url,
                mobile_no: cust.mobile_no,
                house_no: cust.house_no,
                street: cust.street,
                area: cust.area,
                city: cust.city,
                state: cust.state,
                pincode: cust.pincode
            };
            userId = cust.cust_id;
            userType = "customer";
        }

        // Create Session & Tokens
        const sessionId = generateSessionId();
        const expiresAt = calculateExpiryDate(REFRESH_TOKEN_EXPIRY);
        const deviceInfo = parseDeviceInfo(req);
        const ipAddress = getClientIp(req);
        const userAgent = req.headers["user-agent"] || "";

        const tokenPayload = {
            userId,
            email: normalizedEmail,
            role: userType === "employee" ? (user.emp_role || "employee") : "customer",
            userType,
            sessionId
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken({ userId, userType, sessionId });
        const refreshTokenHash = hashToken(refreshToken);

        // Store session in DB
        await sessionModel.createSession({
            sessionId,
            userId,
            userType,
            refreshTokenHash,
            ipAddress,
            userAgent,
            deviceInfo,
            expiresAt
        });

        setRefreshTokenCookie(res, refreshToken);

        res.json({
            success: true,
            message: `Welcome back, ${user.name}!`,
            user,
            accessToken,
            refreshToken,
            sessionId,
            deviceInfo,
            expiresIn: ACCESS_TOKEN_EXPIRY
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Login failed", error: error.message });
    }
};

/**
 * Generate Google OAuth 2.0 authorization URL with permissions consent
 */
export const getGoogleAuthUrl = (req, res) => {
    try {
        const client = getOAuth2Client();
        const authUrl = client.generateAuthUrl({
            access_type: "offline",
            scope: [
                "https://www.googleapis.com/auth/userinfo.profile",
                "https://www.googleapis.com/auth/userinfo.email",
                "openid"
            ],
            include_granted_scopes: true,
            prompt: "consent"
        });

        // If the user visits this in a browser or links to it directly, redirect to Google consent screen
        if (req.headers.accept?.includes("text/html") || req.query.redirect === "true") {
            return res.redirect(authUrl);
        }

        res.json({ success: true, url: authUrl });
    } catch (error) {
        console.error("Error generating Google Auth URL:", error);
        res.status(500).json({ success: false, message: "Failed to initiate Google authentication", error: error.message });
    }
};

/**
 * Handle Google OAuth 2.0 Callback (user approved permission on Google)
 */
export const googleAuthCallback = async (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    try {
        const { code, error } = req.query;

        if (error) {
            console.warn("User rejected or Google OAuth returned error:", error);
            return res.redirect(`${frontendUrl}/#auth?error=${encodeURIComponent("Google permission was not granted: " + error)}`);
        }

        if (!code) {
            return res.redirect(`${frontendUrl}/#auth?error=${encodeURIComponent("Authorization code missing from Google callback")}`);
        }

        const client = getOAuth2Client();
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);

        let googlePayload = null;

        // Try getting payload from id_token
        if (tokens.id_token) {
            try {
                const ticket = await client.verifyIdToken({
                    idToken: tokens.id_token,
                    audience: process.env.GOOGLE_CLIENT_ID
                });
                googlePayload = ticket.getPayload();
            } catch (err) {
                console.warn("verifyIdToken warning in callback:", err.message);
            }
        }

        // If payload not obtained from id_token, fetch from Google userinfo API
        if (!googlePayload || !googlePayload.email) {
            const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${tokens.access_token}` }
            });
            if (userinfoRes.ok) {
                googlePayload = await userinfoRes.json();
            }
        }

        if (!googlePayload || !googlePayload.email) {
            return res.redirect(`${frontendUrl}/#auth?error=${encodeURIComponent("Unable to retrieve email from Google Account")}`);
        }

        const googleId = googlePayload.sub;
        const email = googlePayload.email.trim().toLowerCase();
        const name = googlePayload.name || email.split("@")[0];
        const avatarUrl = googlePayload.picture || null;

        // Create or update customer in database
        const customer = await authModel.createOrUpdateGoogleCustomer({
            googleId,
            email,
            name,
            avatarUrl
        });

        // Create Session & Tokens
        const sessionId = generateSessionId();
        const expiresAt = calculateExpiryDate(REFRESH_TOKEN_EXPIRY);
        const deviceInfo = parseDeviceInfo(req);
        const ipAddress = getClientIp(req);
        const userAgent = req.headers["user-agent"] || "";

        const tokenPayload = {
            userId: customer.cust_id,
            email,
            role: "customer",
            userType: "customer",
            sessionId
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken({ userId: customer.cust_id, userType: "customer", sessionId });
        const refreshTokenHash = hashToken(refreshToken);

        await sessionModel.createSession({
            sessionId,
            userId: customer.cust_id,
            userType: "customer",
            refreshTokenHash,
            ipAddress,
            userAgent,
            deviceInfo,
            expiresAt
        });

        setRefreshTokenCookie(res, refreshToken);

        const safeUser = {
            cust_id: customer.cust_id,
            name: customer.name,
            email: customer.email,
            role: "customer",
            avatar_url: customer.avatar_url,
            mobile_no: customer.mobile_no || "",
            city: customer.city || "Ahmedabad",
            state: customer.state || "Gujarat",
            pincode: customer.pincode || "380001"
        };

        const responseData = JSON.stringify({
            user: safeUser,
            accessToken,
            refreshToken,
            sessionId,
            expiresIn: ACCESS_TOKEN_EXPIRY
        });

        return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>Google Sign-In Successful</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fafaf9; color: #1c1917; }
                    .card { background: white; padding: 24px 32px; border-radius: 16px; border: 1px solid #e7e5e4; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                </style>
            </head>
            <body>
                <div class="card">
                    <h3 style="margin-top:0">Google Permission Granted</h3>
                    <p style="color:#78716c;font-size:14px">Finalizing sign in to ThreadCraft...</p>
                </div>
                <script>
                    const authData = ${responseData};
                    try {
                        if (window.opener && !window.opener.closed) {
                            window.opener.postMessage({ type: "GOOGLE_AUTH_SUCCESS", data: authData }, "*");
                            window.close();
                        } else {
                            localStorage.setItem("threadcraft_access_token", authData.accessToken);
                            localStorage.setItem("threadcraft_refresh_token", authData.refreshToken);
                            localStorage.setItem("threadcraft_session_id", authData.sessionId);
                            localStorage.setItem("threadcraft_customer", JSON.stringify(authData.user));
                            window.location.href = "${frontendUrl}/#home";
                        }
                    } catch (e) {
                        window.location.href = "${frontendUrl}/#home";
                    }
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error("Google Auth Callback Error:", error);
        return res.redirect(`${frontendUrl}/#auth?error=${encodeURIComponent("Google authentication failed: " + error.message)}`);
    }
};

/**
 * "Continue with Google" Authentication (Direct ID Token or Credential)
 */
export const googleAuth = async (req, res) => {
    try {
        const { credential, idToken, profile } = req.body;
        const rawToken = credential || idToken;

        let googlePayload = null;

        // Try verifying with Google Auth Library
        if (rawToken) {
            try {
                const client = getOAuth2Client();
                const ticket = await client.verifyIdToken({
                    idToken: rawToken,
                    audience: process.env.GOOGLE_CLIENT_ID
                });
                googlePayload = ticket.getPayload();
            } catch (err) {
                console.warn("Google token verification with clientId failed, trying decoded JWT payload:", err.message);
                try {
                    const base64Url = rawToken.split(".")[1];
                    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
                    const jsonPayload = Buffer.from(base64, "base64").toString("utf8");
                    googlePayload = JSON.parse(jsonPayload);
                } catch (parseErr) {
                    console.error("Failed to decode token payload:", parseErr);
                }
            }
        }

        // If client passed direct verified profile
        if (!googlePayload && profile?.email) {
            googlePayload = {
                sub: profile.id || profile.sub || `g_${Date.now()}`,
                email: profile.email,
                name: profile.name,
                picture: profile.picture || profile.avatar
            };
        }

        if (!googlePayload || !googlePayload.email) {
            return res.status(400).json({
                success: false,
                message: "Invalid Google credential or unable to retrieve email from Google"
            });
        }

        const googleId = googlePayload.sub;
        const email = googlePayload.email.trim().toLowerCase();
        const name = googlePayload.name || email.split("@")[0];
        const avatarUrl = googlePayload.picture || null;

        // Resolve or create customer account
        const customer = await authModel.createOrUpdateGoogleCustomer({
            googleId,
            email,
            name,
            avatarUrl
        });

        // Create Session & Tokens
        const sessionId = generateSessionId();
        const expiresAt = calculateExpiryDate(REFRESH_TOKEN_EXPIRY);
        const deviceInfo = parseDeviceInfo(req);
        const ipAddress = getClientIp(req);
        const userAgent = req.headers["user-agent"] || "";

        const tokenPayload = {
            userId: customer.cust_id,
            email,
            role: "customer",
            userType: "customer",
            sessionId
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken({ userId: customer.cust_id, userType: "customer", sessionId });
        const refreshTokenHash = hashToken(refreshToken);

        // Store session
        await sessionModel.createSession({
            sessionId,
            userId: customer.cust_id,
            userType: "customer",
            refreshTokenHash,
            ipAddress,
            userAgent,
            deviceInfo,
            expiresAt
        });

        setRefreshTokenCookie(res, refreshToken);

        res.json({
            success: true,
            message: `Signed in as ${customer.name} with Google`,
            user: {
                ...customer,
                role: "customer"
            },
            accessToken,
            refreshToken,
            sessionId,
            deviceInfo,
            expiresIn: ACCESS_TOKEN_EXPIRY
        });
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ success: false, message: "Google authentication failed", error: error.message });
    }
};

/**
 * Refresh Token Rotation (Issues new Access Token & new Refresh Token)
 */
export const refreshTokens = async (req, res) => {
    try {
        const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

        if (!rawRefreshToken) {
            return res.status(401).json({
                success: false,
                code: "NO_REFRESH_TOKEN",
                message: "Refresh token is missing. Please log in again."
            });
        }

        // Verify Refresh Token JWT signature & expiration
        const decoded = verifyRefreshToken(rawRefreshToken);
        if (!decoded || !decoded.sessionId) {
            return res.status(401).json({
                success: false,
                code: "INVALID_REFRESH_TOKEN",
                message: "Refresh token is invalid or expired."
            });
        }

        // Find session in MySQL
        const session = await sessionModel.findSessionById(decoded.sessionId);
        if (!session) {
            return res.status(401).json({
                success: false,
                code: "SESSION_NOT_FOUND",
                message: "Session expired or revoked. Please log in again."
            });
        }

        if (session.is_revoked) {
            return res.status(401).json({
                success: false,
                code: "SESSION_REVOKED",
                message: "This session has been revoked."
            });
        }

        if (new Date(session.expires_at) < new Date()) {
            return res.status(401).json({
                success: false,
                code: "SESSION_EXPIRED",
                message: "Session expired. Please log in again."
            });
        }

        // Verify token hash matches stored hash
        const currentHash = hashToken(rawRefreshToken);
        if (currentHash !== session.refresh_token_hash) {
            // Potential reuse attack! Revoke this compromised session immediately
            await sessionModel.revokeSession(session.session_id);
            return res.status(403).json({
                success: false,
                code: "TOKEN_MISMATCH",
                message: "Refresh token reuse detected. Session has been revoked for security."
            });
        }

        // Fetch user data for new token payload
        let user;
        let role;
        if (session.user_type === "employee") {
            user = await authModel.findEmployeeById(session.user_id);
            role = user?.emp_role || "employee";
        } else {
            user = await authModel.findCustomerById(session.user_id);
            role = "customer";
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Rotate Tokens
        const tokenPayload = {
            userId: session.user_id,
            email: user.email || user.emp_email,
            role,
            userType: session.user_type,
            sessionId: session.session_id
        };

        const newAccessToken = generateAccessToken(tokenPayload);
        const newRefreshToken = generateRefreshToken({
            userId: session.user_id,
            userType: session.user_type,
            sessionId: session.session_id
        });
        const newRefreshTokenHash = hashToken(newRefreshToken);
        const newExpiresAt = calculateExpiryDate(REFRESH_TOKEN_EXPIRY);

        // Update session in DB with rotated token hash
        await sessionModel.updateSessionToken(session.session_id, newRefreshTokenHash, newExpiresAt);

        setRefreshTokenCookie(res, newRefreshToken);

        res.json({
            success: true,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expiresIn: ACCESS_TOKEN_EXPIRY
        });
    } catch (error) {
        console.error("Refresh token error:", error);
        res.status(500).json({ success: false, message: "Failed to refresh token", error: error.message });
    }
};

/**
 * Logout current session
 */
export const logout = async (req, res) => {
    try {
        const sessionId = req.sessionId || req.body?.sessionId || req.user?.sessionId;
        const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

        // Revoke by session ID
        if (sessionId) {
            await sessionModel.revokeSession(sessionId);
        } else if (rawRefreshToken) {
            const decoded = verifyRefreshToken(rawRefreshToken);
            if (decoded?.sessionId) {
                await sessionModel.revokeSession(decoded.sessionId);
            }
        }

        res.clearCookie("refreshToken");

        res.json({
            success: true,
            message: "Successfully logged out and session terminated."
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ success: false, message: "Logout failed", error: error.message });
    }
};

/**
 * Logout from all devices (revokes all user sessions)
 */
export const logoutAll = async (req, res) => {
    try {
        const userId = req.user.userId;
        const userType = req.user.userType || "customer";

        const count = await sessionModel.revokeAllUserSessions(userId, userType);
        res.clearCookie("refreshToken");

        res.json({
            success: true,
            message: `Successfully logged out from all devices (${count} active sessions terminated).`
        });
    } catch (error) {
        console.error("Logout all error:", error);
        res.status(500).json({ success: false, message: "Failed to log out all sessions", error: error.message });
    }
};

/**
 * Get all active sessions for current user
 */
export const getActiveSessions = async (req, res) => {
    try {
        const userId = req.user.userId;
        const userType = req.user.userType || "customer";

        const sessions = await sessionModel.getUserActiveSessions(userId, userType);

        const mapped = sessions.map((s) => ({
            sessionId: s.session_id,
            deviceInfo: s.device_info || "Web Browser",
            ipAddress: s.ip_address,
            createdAt: s.created_at,
            lastActiveAt: s.last_active_at,
            isCurrent: s.session_id === req.sessionId
        }));

        res.json({
            success: true,
            sessions: mapped
        });
    } catch (error) {
        console.error("Get sessions error:", error);
        res.status(500).json({ success: false, message: "Failed to retrieve sessions", error: error.message });
    }
};

/**
 * Revoke specific session by ID (remote device logout)
 */
export const revokeSessionById = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.userId;

        const session = await sessionModel.findSessionById(sessionId);
        if (!session) {
            return res.status(404).json({ success: false, message: "Session not found" });
        }

        if (session.user_id !== userId) {
            return res.status(403).json({ success: false, message: "Not authorized to terminate this session" });
        }

        await sessionModel.revokeSession(sessionId);

        res.json({
            success: true,
            message: "Session terminated successfully."
        });
    } catch (error) {
        console.error("Revoke session error:", error);
        res.status(500).json({ success: false, message: "Failed to revoke session", error: error.message });
    }
};

/**
 * Get Current Authenticated User & Session Details
 */
export const getMe = async (req, res) => {
    try {
        const { userId, userType, sessionId } = req.user;

        let user;
        if (userType === "employee") {
            user = await authModel.findEmployeeById(userId);
            if (user) user.role = "employee";
        } else {
            user = await authModel.findCustomerById(userId);
            if (user) user.role = "customer";
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const session = await sessionModel.findSessionById(sessionId);

        res.json({
            success: true,
            user,
            session: {
                sessionId,
                deviceInfo: session?.device_info,
                ipAddress: session?.ip_address,
                createdAt: session?.created_at,
                lastActiveAt: session?.last_active_at
            }
        });
    } catch (error) {
        console.error("Get me error:", error);
        res.status(500).json({ success: false, message: "Failed to retrieve user data", error: error.message });
    }
};
