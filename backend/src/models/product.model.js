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
            ) AS variants,
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'review_id', rev.review_id,
                        'cust_id', rev.cust_id,
                        'customer_name', COALESCE(cust.name, 'Verified Customer'),
                        'rating', rev.rating,
                        'comments', rev.comments,
                        'review_date', DATE_FORMAT(rev.review_date, '%Y-%m-%d')
                    )
                )
                FROM review rev
                LEFT JOIN customer cust ON rev.cust_id = cust.cust_id
                WHERE rev.product_id = p.product_id
            ) AS reviews
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

export const createProductWithVariant = async ({
    category_id,
    brand_id,
    product_name,
    base_price,
    product_description,
    image_url,
    color_size,
    selling_price,
    initial_stock = 0,
    branch_id = 1
}) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Execute stored procedure for product insertion
        const [prodResult] = await connection.query(
            "CALL sp_insert_product(?, ?, ?, ?, ?, ?, @new_product_id)",
            [
                category_id,
                brand_id,
                product_name.trim(),
                base_price,
                product_description?.trim() || null,
                image_url?.trim() || null
            ]
        );

        // Extract generated product_id from procedure result
        const productId = prodResult[0]?.[0]?.inserted_id || prodResult[0]?.[0]?.inserted_product_id;
        if (!productId) {
            throw new Error("Failed to retrieve generated product ID from sp_insert_product.");
        }

        // 2. Execute stored procedure for variant & initial inventory insertion
        const [variantResult] = await connection.query(
            "CALL sp_add_product_variant(?, ?, ?, ?, @new_variant_id)",
            [
                productId,
                color_size.trim(),
                selling_price || base_price,
                Number(initial_stock) || 0
            ]
        );

        const variantId = variantResult[0]?.[0]?.variant_id;
        if (!variantId) {
            throw new Error("Failed to retrieve generated variant ID from sp_add_product_variant.");
        }

        // If a non-default branch is specified and stock > 0, ensure inventory record for that branch
        if (branch_id && Number(branch_id) !== 1 && Number(initial_stock) > 0) {
            await connection.query(
                `INSERT INTO inventory (branch_id, variant_id, quantity, reorder_level)
                 VALUES (?, ?, ?, 10)
                 ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
                [Number(branch_id), variantId, Number(initial_stock)]
            );
        }

        await connection.commit();
        return { productId, variantId };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const updateProductVariant = async (variantId, { color_size, selling_price, is_active = 1 }) => {
    const [rows] = await pool.query(
        "CALL sp_update_product_variant(?, ?, ?, ?)",
        [
            Number(variantId),
            color_size.trim(),
            Number(selling_price),
            is_active ? 1 : 0
        ]
    );

    return rows[0]?.[0] || { updated_variant_id: Number(variantId), status: "Success" };
};

export const updateProduct = async (productId, { product_name, base_price, product_description, image_url }) => {
    const [rows] = await pool.query(
        "CALL sp_update_product(?, ?, ?, ?, ?)",
        [
            Number(productId),
            product_name.trim(),
            Number(base_price),
            product_description !== undefined && product_description !== null ? String(product_description).trim() : null,
            image_url !== undefined && image_url !== null ? String(image_url).trim() : null
        ]
    );

    return rows[0]?.[0] || { updated_product_id: Number(productId), status: "Success" };
};

export const createReview = async ({ product_id, cust_id, customer_name, rating, comments }) => {
    let finalCustId = cust_id ? Number(cust_id) : null;

    if (!finalCustId) {
        if (customer_name && customer_name.trim()) {
            const trimmedName = customer_name.trim();
            const [existing] = await pool.query(
                "SELECT cust_id FROM customer WHERE name = ? LIMIT 1",
                [trimmedName]
            );
            if (existing && existing.length > 0) {
                finalCustId = existing[0].cust_id;
            } else {
                const [insertResult] = await pool.query(
                    "INSERT INTO customer (name) VALUES (?)",
                    [trimmedName]
                );
                finalCustId = insertResult.insertId;
            }
        } else {
            finalCustId = 1;
        }
    }

    const cleanRating = Math.min(5, Math.max(1, Number(rating) || 5));
    const cleanComments = comments ? String(comments).trim() : "";

    const [rows] = await pool.query(
        "CALL sp_insert_review(?, ?, ?, ?, @new_review_id)",
        [Number(product_id), finalCustId, cleanRating, cleanComments]
    );

    return rows[0]?.[0] || { review_id: null, status: "Review submitted successfully" };
};

export const deleteReview = async (reviewId) => {
    const cleanReviewId = Number(reviewId);
    try {
        const [rows] = await pool.query("CALL sp_delete_review(?)", [cleanReviewId]);
        return rows[0]?.[0] || { deleted_review_id: cleanReviewId, status: "Review deleted successfully" };
    } catch (spErr) {
        console.warn("Notice: sp_delete_review execution fallback:", spErr.message);
        const [delResult] = await pool.query("DELETE FROM review WHERE review_id = ?", [cleanReviewId]);
        return { deleted_review_id: cleanReviewId, affectedRows: delResult.affectedRows, status: "Review deleted successfully" };
    }
};


