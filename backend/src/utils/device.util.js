/**
 * Extract human-readable device and browser info from request headers
 */
export const parseDeviceInfo = (req) => {
    const userAgent = req.headers["user-agent"] || "Unknown Device";
    
    let browser = "Unknown Browser";
    if (userAgent.includes("Edg/")) browser = "Edge";
    else if (userAgent.includes("Chrome/") && !userAgent.includes("Edg/")) browser = "Chrome";
    else if (userAgent.includes("Safari/") && !userAgent.includes("Chrome/")) browser = "Safari";
    else if (userAgent.includes("Firefox/")) browser = "Firefox";
    else if (userAgent.includes("Opera/") || userAgent.includes("OPR/")) browser = "Opera";
    else if (userAgent.includes("Postman")) browser = "Postman";

    let os = "Unknown OS";
    if (userAgent.includes("Windows NT 10.0")) os = "Windows 10/11";
    else if (userAgent.includes("Windows")) os = "Windows";
    else if (userAgent.includes("Macintosh") || userAgent.includes("Mac OS")) os = "macOS";
    else if (userAgent.includes("iPhone")) os = "iPhone iOS";
    else if (userAgent.includes("iPad")) os = "iPad iOS";
    else if (userAgent.includes("Android")) os = "Android";
    else if (userAgent.includes("Linux")) os = "Linux";

    return `${browser} on ${os}`;
};

/**
 * Extract client IP address safely considering reverse proxies
 */
export const getClientIp = (req) => {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    return req.socket?.remoteAddress || req.ip || "127.0.0.1";
};
