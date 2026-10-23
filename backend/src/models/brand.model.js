import pool from "../db/index.js";

export const getAllBrands = async () => {
    const [rows] = await pool.query(
        "SELECT brand_id, brand_name, description, web_site FROM brand ORDER BY brand_id ASC"
    );
    return rows;
};
