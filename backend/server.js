import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("ThreadCraft backend is running");
});

app.get("/products", async (req, res) => {
    try {
        const [products] = await db.query(
            "SELECT * FROM product"
        );

        res.json(products);
    } catch (error) {
        console.error("Database error:", error);

        res.status(500).json({
            message: "Failed to fetch products"
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});