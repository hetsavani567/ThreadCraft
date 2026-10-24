import pool, { formatDbError } from "../db/index.js";

export const getHealth = async (req, res) => {
    try {
        await pool.query("SELECT 1");
        res.json({
            status: "ok",
            connected: true,
            database: process.env.DB_NAME || "retail_db",
            message: `Connected to MySQL database (${process.env.DB_NAME || "retail_db"})`
        });
    } catch (error) {
        const errorDetail = formatDbError(error);
        res.json({
            status: "offline",
            connected: false,
            database: process.env.DB_NAME || "retail_db",
            message: errorDetail,
            error: errorDetail
        });
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
