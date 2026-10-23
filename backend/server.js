import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import db from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

app.use(cors());
app.use(express.json());

// Root endpoint
app.get(["/", "/api"], (req, res) => {
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
});

// Health check endpoint (checks MySQL connection)
app.get(["/health", "/api/health"], async (req, res) => {
    try {
        await db.query("SELECT 1");
        res.json({
            status: "ok",
            message: `Connected to MySQL database (${process.env.DB_NAME || "retail_db"})`,
            database: process.env.DB_NAME || "retail_db"
        });
    } catch (error) {
        console.error("Database connection check failed:", error.message);
        res.status(500).json({
            status: "error",
            message: `MySQL Connection Error: ${error.message}`
        });
    }
});

// Get all products with joined category, brand, rating, variants, and stock
app.get(["/products", "/api/products"], async (req, res) => {
    try {
        const { category, brand, search } = req.query;

        let query = `
            SELECT 
                p.product_id AS id,
                p.product_name AS name,
                CAST(p.base_price AS DOUBLE) AS price,
                p.product_description AS description,
                p.Image_URL AS image,
                p.category_id,
                COALESCE(c.category_type, 'General') AS category,
                p.brand_id,
                COALESCE(b.brand_name, 'Brand') AS brand,
                COALESCE(ROUND(AVG(r.rating), 1), 5.0) AS rating,
                COUNT(DISTINCT r.review_id) AS review_count,
                COALESCE((
                    SELECT SUM(inv.quantity)
                    FROM inventory inv
                    JOIN product_variant pv2 ON inv.variant_id = pv2.variant_id
                    WHERE pv2.product_id = p.product_id
                ), 0) AS total_stock,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'variant_id', pv.variant_id,
                            'color_size', pv.color_size,
                            'selling_price', CAST(pv.selling_price AS DOUBLE),
                            'is_active', pv.is_active
                        )
                    )
                    FROM product_variant pv
                    WHERE pv.product_id = p.product_id AND pv.is_active = 1
                ) AS variants
            FROM product p
            LEFT JOIN category c ON p.category_id = c.category_id
            LEFT JOIN brand b ON p.brand_id = b.brand_id
            LEFT JOIN review r ON p.product_id = r.product_id
            WHERE 1=1
        `;

        const params = [];

        if (category && category !== "All") {
            query += " AND c.category_type = ?";
            params.push(category);
        }

        if (brand && brand !== "All") {
            query += " AND b.brand_name = ?";
            params.push(brand);
        }

        if (search) {
            query += " AND (p.product_name LIKE ? OR p.product_description LIKE ? OR c.category_type LIKE ? OR b.brand_name LIKE ?)";
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        query += " GROUP BY p.product_id, c.category_id, c.category_type, b.brand_id, b.brand_name ORDER BY p.product_id ASC";

        const [products] = await db.query(query, params);

        // Ensure variants is always an array (handle null variants)
        const formatted = products.map((prod) => ({
            ...prod,
            price: Number(prod.price),
            rating: Number(prod.rating),
            review_count: Number(prod.review_count),
            total_stock: Number(prod.total_stock),
            variants: Array.isArray(prod.variants) ? prod.variants : []
        }));

        res.json(formatted);
    } catch (error) {
        console.error("Database error in /products:", error);
        res.status(500).json({
            message: "Failed to fetch products from MySQL database",
            error: error.message
        });
    }
});

// Get single product by ID
app.get(["/products/:id", "/api/products/:id"], async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                p.product_id AS id,
                p.product_name AS name,
                CAST(p.base_price AS DOUBLE) AS price,
                p.product_description AS description,
                p.Image_URL AS image,
                p.category_id,
                COALESCE(c.category_type, 'General') AS category,
                p.brand_id,
                COALESCE(b.brand_name, 'Brand') AS brand,
                COALESCE(ROUND(AVG(r.rating), 1), 5.0) AS rating,
                COUNT(DISTINCT r.review_id) AS review_count,
                COALESCE((
                    SELECT SUM(inv.quantity)
                    FROM inventory inv
                    JOIN product_variant pv2 ON inv.variant_id = pv2.variant_id
                    WHERE pv2.product_id = p.product_id
                ), 0) AS total_stock,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'variant_id', pv.variant_id,
                            'color_size', pv.color_size,
                            'selling_price', CAST(pv.selling_price AS DOUBLE),
                            'is_active', pv.is_active
                        )
                    )
                    FROM product_variant pv
                    WHERE pv.product_id = p.product_id AND pv.is_active = 1
                ) AS variants
            FROM product p
            LEFT JOIN category c ON p.category_id = c.category_id
            LEFT JOIN brand b ON p.brand_id = b.brand_id
            LEFT JOIN review r ON p.product_id = r.product_id
            WHERE p.product_id = ?
            GROUP BY p.product_id, c.category_id, c.category_type, b.brand_id, b.brand_name
        `;

        const [products] = await db.query(query, [id]);

        if (products.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        const prod = products[0];
        res.json({
            ...prod,
            price: Number(prod.price),
            rating: Number(prod.rating),
            review_count: Number(prod.review_count),
            total_stock: Number(prod.total_stock),
            variants: Array.isArray(prod.variants) ? prod.variants : []
        });
    } catch (error) {
        console.error("Database error in /products/:id:", error);
        res.status(500).json({
            message: "Failed to fetch product details",
            error: error.message
        });
    }
});

// Get all categories from MySQL
app.get(["/categories", "/api/categories"], async (req, res) => {
    try {
        const [categories] = await db.query(
            "SELECT category_id, category_type, description FROM category ORDER BY category_id ASC"
        );
        res.json(categories);
    } catch (error) {
        console.error("Database error in /categories:", error);
        res.status(500).json({
            message: "Failed to fetch categories",
            error: error.message
        });
    }
});

// Get all brands from MySQL
app.get(["/brands", "/api/brands"], async (req, res) => {
    try {
        const [brands] = await db.query(
            "SELECT brand_id, brand_name, description, web_site FROM brand ORDER BY brand_id ASC"
        );
        res.json(brands);
    } catch (error) {
        console.error("Database error in /brands:", error);
        res.status(500).json({
            message: "Failed to fetch brands",
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});