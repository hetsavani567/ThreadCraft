import pool from "./index.js";

export async function updateAddVariantSp() {
    console.log("Updating sp_add_product_variant to accept discount_percent...");
    await pool.query("DROP PROCEDURE IF EXISTS sp_add_product_variant");
    await pool.query(`
        CREATE PROCEDURE sp_add_product_variant(
            IN p_product_id INT,
            IN p_color_size VARCHAR(50),
            IN p_selling_price DECIMAL(10,2),
            IN p_initial_stock INT,
            IN p_discount_percent INT,
            OUT p_new_variant_id INT
        )
        BEGIN
            IF (SELECT COUNT(*) FROM product WHERE product_id = p_product_id) = 0 THEN
                SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Validation Error: Product ID does not exist.';
            END IF;

            IF p_color_size IS NULL OR TRIM(p_color_size) = '' THEN
                SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Validation Error: Color and Size cannot be empty.';
            END IF;

            IF p_selling_price <= 0 THEN
                SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Validation Error: Selling price must be greater than zero.';
            END IF;

            IF (SELECT COUNT(*) FROM product_variant WHERE product_id = p_product_id AND color_size = p_color_size) > 0 THEN
                SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Validation Error: Variant with this color/size already exists for this product.';
            END IF;

            INSERT INTO product_variant (
                product_id,
                color_size,
                selling_price,
                is_active,
                discount_percent
            ) VALUES (
                p_product_id,
                TRIM(p_color_size),
                p_selling_price,
                1,
                COALESCE(p_discount_percent, 0)
            );

            SET p_new_variant_id = LAST_INSERT_ID();

            IF p_initial_stock IS NOT NULL AND p_initial_stock > 0 THEN
                INSERT INTO inventory (branch_id, variant_id, quantity)
                VALUES (1, p_new_variant_id, p_initial_stock);
            END IF;

            SELECT 
                p_new_variant_id AS variant_id,
                p_product_id AS product_id,
                p_color_size AS color_size,
                p_selling_price AS selling_price,
                COALESCE(p_discount_percent, 0) AS discount_percent,
                COALESCE(p_initial_stock, 0) AS added_stock,
                'Variant added successfully' AS status;
        END
    `);
    console.log("sp_add_product_variant updated successfully.");
}

if (process.argv[1]?.includes("migrate_update_add_variant_sp.js")) {
    updateAddVariantSp()
        .then(() => {
            console.log("Done.");
            process.exit(0);
        })
        .catch((err) => {
            console.error("Failed:", err);
            process.exit(1);
        });
}

