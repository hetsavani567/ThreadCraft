import pool from "../db/index.js";

/**
 * Insert a new session record into user_sessions
 */
export const createSession = async ({
    sessionId,
    userId,
    userType = "customer",
    refreshTokenHash,
    ipAddress = null,
    userAgent = null,
    deviceInfo = null,
    expiresAt
}) => {
    const [result] = await pool.query(
        `INSERT INTO user_sessions 
         (session_id, user_id, user_type, refresh_token_hash, ip_address, user_agent, device_info, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [sessionId, userId, userType, refreshTokenHash, ipAddress, userAgent, deviceInfo, expiresAt]
    );
    return {
        sessionId,
        userId,
        userType,
        deviceInfo,
        expiresAt
    };
};

/**
 * Find an active session by session_id
 */
export const findSessionById = async (sessionId) => {
    if (!sessionId) return null;
    const [rows] = await pool.query(
        `SELECT session_id, user_id, user_type, refresh_token_hash, ip_address, user_agent, 
                device_info, is_revoked, created_at, expires_at, last_active_at
         FROM user_sessions 
         WHERE session_id = ? LIMIT 1`,
        [sessionId]
    );
    return rows.length > 0 ? rows[0] : null;
};

/**
 * Update session on refresh token rotation
 */
export const updateSessionToken = async (sessionId, newRefreshTokenHash, newExpiresAt) => {
    const [result] = await pool.query(
        `UPDATE user_sessions 
         SET refresh_token_hash = ?, expires_at = ?, last_active_at = NOW() 
         WHERE session_id = ? AND is_revoked = 0`,
        [newRefreshTokenHash, newExpiresAt, sessionId]
    );
    return result.affectedRows > 0;
};

/**
 * Revoke a specific session
 */
export const revokeSession = async (sessionId) => {
    const [result] = await pool.query(
        `UPDATE user_sessions SET is_revoked = 1 WHERE session_id = ?`,
        [sessionId]
    );
    return result.affectedRows > 0;
};

/**
 * Revoke all active sessions for a user (e.g., on password reset or remote logout everywhere)
 */
export const revokeAllUserSessions = async (userId, userType = "customer") => {
    const [result] = await pool.query(
        `UPDATE user_sessions SET is_revoked = 1 WHERE user_id = ? AND user_type = ?`,
        [userId, userType]
    );
    return result.affectedRows;
};

/**
 * Get all active sessions for a user
 */
export const getUserActiveSessions = async (userId, userType = "customer") => {
    const [rows] = await pool.query(
        `SELECT session_id, ip_address, device_info, created_at, last_active_at, expires_at
         FROM user_sessions 
         WHERE user_id = ? AND user_type = ? AND is_revoked = 0 AND expires_at > NOW()
         ORDER BY last_active_at DESC`,
        [userId, userType]
    );
    return rows;
};

/**
 * Remove stale/expired sessions
 */
export const cleanupExpiredSessions = async () => {
    const [result] = await pool.query(
        `DELETE FROM user_sessions WHERE expires_at < NOW() OR (is_revoked = 1 AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY))`
    );
    return result.affectedRows;
};
