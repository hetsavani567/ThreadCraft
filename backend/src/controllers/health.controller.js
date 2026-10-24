import pool from "../db/index.js";

export const getHealth = async (req, res) => {
    try {
        await pool.query("SELECT 1");
        res.json({
            status: "ok",
            message: `Connected to MySQL database (${process.env.DB_NAME || "retail_db"})`,
            database: process.env.DB_NAME || "retail_db"
        });
    } catch (error) {
        try {
            const conn = await pool.getConnection();
            await conn.query("SELECT 1");
            conn.release();
            return res.json({
                status: "ok",
                message: `Connected to MySQL database (${process.env.DB_NAME || "retail_db"})`,
                database: process.env.DB_NAME || "retail_db"
            });
        } catch (retryErr) {
            console.error("Database connection check failed:", retryErr.message);
            res.status(500).json({
                status: "error",
                message: `MySQL Connection Error: ${retryErr.message}`
            });
        }
    }
};

export const getRoot = (req, res) => {
    res.json({
        message: "ThreadCraft Retail API is running",
        version: "1.0.0",
        endpoints: {
            health: "/api/health",
            products: "/api/products",
            categories: "/api/categories",
            brands: "/api/brands"
        }
    });
};
