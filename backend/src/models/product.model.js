import pool from "../db/index.js";

export const getAllProducts = async ({ category, brand, search } = {}) => {
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

    const [rows] = await pool.query(query, params);
    return rows;
};

export const getProductById = async (id) => {
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

    const [rows] = await pool.query(query, [id]);
    return rows[0] || null;
};
