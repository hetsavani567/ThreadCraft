import pool from "./index.js";

async function columnExists(tableName, columnName) {
    const [rows] = await pool.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [tableName, columnName]
    );
    return rows.length > 0;
}

export async function runDiscountMigration() {
    console.log("Starting Discount Migration for product_variant...");

    try {
        // 1. Add discount_percent column to product_variant if not exists
        if (!(await columnExists("product_variant", "discount_percent"))) {
            console.log("Adding discount_percent column to product_variant table...");
            await pool.query(
                "ALTER TABLE product_variant ADD COLUMN discount_percent INT NOT NULL DEFAULT 0 AFTER is_active"
            );
            console.log("Column discount_percent added successfully.");
        } else {
            console.log("Column discount_percent already exists in product_variant.");
        }

        // 2. Re-create sp_update_product_variant to accept p_discount_percent
        console.log("Updating sp_update_product_variant stored procedure...");
        await pool.query("DROP PROCEDURE IF EXISTS sp_update_product_variant");

        const procedureSql = `
        CREATE PROCEDURE sp_update_product_variant(
            IN p_variant_id INT,
            IN p_color_size VARCHAR(50),
            IN p_selling_price DECIMAL(10,2),
            IN p_is_active BOOLEAN,
            IN p_discount_percent INT
        )
        BEGIN
            IF (SELECT COUNT(*) FROM product_variant WHERE variant_id = p_variant_id) = 0 THEN
                SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Validation Error: Variant ID does not exist.';
            END IF;

            IF p_selling_price <= 0 THEN
                SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Validation Error: Selling price must be greater than zero.';
            END IF;

            UPDATE product_variant
            SET color_size = TRIM(p_color_size),
                selling_price = p_selling_price,
                is_active = COALESCE(p_is_active, 1),
                discount_percent = COALESCE(p_discount_percent, 0)
            WHERE variant_id = p_variant_id;

            SELECT p_variant_id AS updated_variant_id, 'Product variant updated successfully' AS status;
        END
        `;
        await pool.query(procedureSql);
        console.log("Procedure sp_update_product_variant recreated successfully with discount_percent support.");

        console.log("Discount migration completed successfully!");
    } catch (error) {
        console.error("Migration error:", error);
        throw error;
    }
}

if (process.argv[1]?.includes("migrate_discount.js")) {
    runDiscountMigration()
        .then(() => {
            console.log("Done.");
            process.exit(0);
        })
        .catch((err) => {
            console.error("Migration failed:", err);
            process.exit(1);
        });
}

