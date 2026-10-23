import pool from "../db/index.js";

export const getAllCategories = async () => {
    const [rows] = await pool.query(
        "SELECT category_id, category_type, description FROM category ORDER BY category_id ASC"
    );
    return rows;
};
