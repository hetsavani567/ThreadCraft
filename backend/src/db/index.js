import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory first, then root if needed
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config();

export const formatDbError = (error) => {
    if (!error) return "Unknown database error";
    if (
        error.code === "ECONNREFUSED" ||
        (error.errors && error.errors.some((e) => e.code === "ECONNREFUSED" || e.code === "EACCES"))
    ) {
        return `Cannot connect to MySQL at ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || 3306}. Please ensure your MySQL server or service is running.`;
    }
    if (error.code === "ER_ACCESS_DENIED_ERROR") {
        return `Access denied for user '${process.env.DB_USER || "root"}'. Check DB_PASSWORD in backend/.env.`;
    }
    if (error.code === "ER_BAD_DB_ERROR") {
        return `Database '${process.env.DB_NAME || "retail_db"}' not found. Run 'npm run db:init' to create it.`;
    }
    if (error.code === "ER_NO_SUCH_TABLE") {
        return `Tables not found in '${process.env.DB_NAME || "retail_db"}'. Run 'npm run db:init' to create them.`;
    }
    if (error.message && error.message.trim().length > 0) return error.message;
    if (error.errors && error.errors.length > 0) {
        return error.errors.map((e) => e.message || e.code).filter(Boolean).join("; ") || "Connection failed";
    }
    return error.code || "Connection failed";
};

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "retail_db",
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: (process.env.DB_SSL === "true" || process.env.DB_HOST?.includes("tidbcloud.com"))
        ? { minVersion: "TLSv1.2", rejectUnauthorized: true }
        : undefined
});

export const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log(`[Database] Connected successfully to MySQL (${process.env.DB_NAME || "retail_db"})`);
        connection.release();
        return true;
    } catch (error) {
        const message = formatDbError(error);
        console.warn(`[Database Notice] ${message}`);
        return false;
    }
};

export default pool;
