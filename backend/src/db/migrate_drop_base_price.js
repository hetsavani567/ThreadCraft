import pool from "./index.js";

async function columnExists(tableName, columnName) {
    const [rows] = await pool.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [tableName, columnName]
    );
    return rows.length > 0;
}

export async function runDropBasePriceMigration() {
    console.log("Starting Migration: Dropping base_price from product table...");

    try {
        // 1. Update sp_update_product to not reference base_price
        console.log("Recreating sp_update_product without base_price...");
        await pool.query("DROP PROCEDURE IF EXISTS sp_update_product");
        await pool.query(`
            CREATE PROCEDURE sp_update_product(
                IN p_product_id INT,
                IN p_product_name VARCHAR(150),
                IN p_product_description VARCHAR(500),
                IN p_image_url TEXT
            )
            BEGIN
                IF (SELECT COUNT(*) FROM product WHERE product_id = p_product_id) = 0 THEN
                    SIGNAL SQLSTATE '45000'
                    SET MESSAGE_TEXT = 'Validation Error: Product ID does not exist.';
                END IF;

                UPDATE product
                SET product_name = TRIM(p_product_name),
                    product_description = p_product_description,
                    Image_URL = p_image_url
                WHERE product_id = p_product_id;

                SELECT p_product_id AS updated_product_id, 'Product updated successfully' AS status;
            END
        `);
        console.log("sp_update_product updated successfully.");

        // 2. Update sp_insert_product to not reference base_price
        console.log("Recreating sp_insert_product without base_price...");
        await pool.query("DROP PROCEDURE IF EXISTS sp_insert_product");
        await pool.query(`
            CREATE PROCEDURE sp_insert_product(
                IN p_category_id INT,
                IN p_brand_id INT,
                IN p_product_name VARCHAR(150),
                IN p_product_description VARCHAR(500),
                IN p_image_url TEXT,
                OUT p_new_product_id INT
            )
            BEGIN
                IF (SELECT COUNT(*) FROM category WHERE category_id = p_category_id) = 0 THEN
                    SIGNAL SQLSTATE '45000'
                    SET MESSAGE_TEXT = 'Validation Error: Invalid category_id. Category does not exist.';
                END IF;

                IF (SELECT COUNT(*) FROM brand WHERE brand_id = p_brand_id) = 0 THEN
                    SIGNAL SQLSTATE '45000'
                    SET MESSAGE_TEXT = 'Validation Error: Invalid brand_id. Brand does not exist.';
                END IF;

                INSERT INTO product (
                    category_id,
                    brand_id,
                    product_name,
                    product_description,
                    Image_URL
                ) VALUES (
                    p_category_id,
                    p_brand_id,
                    p_product_name,
                    p_product_description,
                    p_image_url
                );

                SET p_new_product_id = LAST_INSERT_ID();

                SELECT 
                    p_new_product_id AS inserted_product_id,
                    'Product inserted successfully' AS status;
            END
        `);
        console.log("sp_insert_product updated successfully.");

        // 3. Drop base_price column from product table if it exists
        if (await columnExists("product", "base_price")) {
            console.log("Dropping column base_price from product table...");
            await pool.query("ALTER TABLE product DROP COLUMN base_price");
            console.log("Column base_price successfully dropped from product table.");
        } else {
            console.log("Column base_price already does not exist in product table.");
        }

        console.log("Migration completed successfully!");
    } catch (error) {
        console.error("Migration error:", error);
        throw error;
    }
}

if (process.argv[1]?.includes("migrate_drop_base_price.js")) {
    runDropBasePriceMigration()
        .then(() => {
            console.log("Done.");
            process.exit(0);
        })
        .catch((err) => {
            console.error("Migration failed:", err);
            process.exit(1);
        });
}

