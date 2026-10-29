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

const cleanStr = (val) => (val ? String(val).replace(/^["']|["']$/g, "").replace(/\r/g, "").trim() : "");

const host = cleanStr(process.env.DB_HOST) || "localhost";
const user = cleanStr(process.env.DB_USER) || "root";
const password = cleanStr(process.env.DB_PASSWORD);
const database = cleanStr(process.env.DB_NAME) || "retail_db";
const port = Number(cleanStr(process.env.DB_PORT)) || 3306;
const isCloudDb = host.includes("aivencloud.com") || host.includes("tidbcloud.com") || cleanStr(process.env.DB_SSL) === "true";

const pool = mysql.createPool({
    host,
    user,
    password,
    database,
    port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    maxIdle: 0,
    idleTimeout: 30000,
    ssl: isCloudDb
        ? { minVersion: "TLSv1.2", rejectUnauthorized: false }
        : undefined
});

export const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log("Database connected successfully");
        connection.release();
    } catch (error) {
        console.warn("Database connection notice:", error.message);
    }
};

export default pool;
