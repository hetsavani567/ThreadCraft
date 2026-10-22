
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Retail Clothing Store API is running",
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT DATABASE() AS database_name");

    res.json({
      success: true,
      message: "MySQL connected successfully!",
      database: rows[0].database_name,
    });
  } catch (error) {
    console.error("Database connection error:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});


app.get("/api/products", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.product_id AS id,
        p.product_name AS name,
        p.base_price AS price,
        p.product_description AS description,
        c.category_type AS category,
        b.brand_name AS brand
      FROM product p
      LEFT JOIN category c
        ON p.category_id = c.category_id
      LEFT JOIN brand b
        ON p.brand_id = b.brand_id
      ORDER BY p.product_id DESC
    `);

    res.json({
      success: true,
      count: rows.length,
      products: rows,
    });
  } catch (error) {
    console.error("Error fetching products:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}/api/products`);
});


