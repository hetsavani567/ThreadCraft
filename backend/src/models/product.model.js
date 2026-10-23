import pool from "../db/index.js";

export const getAllProducts = async () => {
    const [rows] = await pool.query("SELECT * FROM product");
    return rows;
};

export const getProductById = async (id) => {
    const [rows] = await pool.query("SELECT * FROM product WHERE id = ?", [id]);
    return rows[0] || null;
};
