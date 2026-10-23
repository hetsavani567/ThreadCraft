import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "cloth_shop",
    waitForConnections: true,
    connectionLimit: 10
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
