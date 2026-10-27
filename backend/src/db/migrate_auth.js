import pool from "./index.js";
import bcrypt from "bcrypt";

async function columnExists(tableName, columnName) {
    const [rows] = await pool.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [tableName, columnName]
    );
    return rows.length > 0;
}

export async function runAuthMigration() {
    console.log("Starting Auth & Session Database Migration...");

    try {
        // 1. Update customer table
        if (!(await columnExists("customer", "password_hash"))) {
            console.log("Adding password_hash to customer table...");
            await pool.query("ALTER TABLE customer ADD COLUMN password_hash VARCHAR(255) NULL AFTER email");
        }

        if (!(await columnExists("customer", "google_id"))) {
            console.log("Adding google_id to customer table...");
            await pool.query("ALTER TABLE customer ADD COLUMN google_id VARCHAR(100) NULL UNIQUE AFTER password_hash");
        }

        if (!(await columnExists("customer", "avatar_url"))) {
            console.log("Adding avatar_url to customer table...");
            await pool.query("ALTER TABLE customer ADD COLUMN avatar_url VARCHAR(500) NULL AFTER google_id");
        }

        // 2. Update employee table
        if (!(await columnExists("employee", "password_hash"))) {
            console.log("Adding password_hash to employee table...");
            await pool.query("ALTER TABLE employee ADD COLUMN password_hash VARCHAR(255) NULL AFTER emp_email");
        }

        if (!(await columnExists("employee", "avatar_url"))) {
            console.log("Adding avatar_url to employee table...");
            await pool.query("ALTER TABLE employee ADD COLUMN avatar_url VARCHAR(500) NULL AFTER password_hash");
        }

        // 3. Create user_sessions table
        console.log("Creating user_sessions table if not exists...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_sessions (
                session_id VARCHAR(64) PRIMARY KEY,
                user_id INT NOT NULL,
                user_type ENUM('customer', 'employee') NOT NULL DEFAULT 'customer',
                refresh_token_hash VARCHAR(255) NOT NULL,
                ip_address VARCHAR(45) NULL,
                user_agent TEXT NULL,
                device_info VARCHAR(100) NULL,
                is_revoked TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME NOT NULL,
                last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_user (user_id, user_type),
                INDEX idx_expires (expires_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 4. Seed default passwords for existing customer/employee records with NULL password_hash
        const defaultCustHash = await bcrypt.hash("Customer123", 10);
        const [custUpdate] = await pool.query(
            "UPDATE customer SET password_hash = ? WHERE password_hash IS NULL OR password_hash = ''",
            [defaultCustHash]
        );
        console.log(`Updated ${custUpdate.affectedRows} customer records with default password (Customer123).`);

        const defaultEmpHash = await bcrypt.hash("Employee123", 10);
        const [empUpdate] = await pool.query(
            "UPDATE employee SET password_hash = ? WHERE password_hash IS NULL OR password_hash = ''",
            [defaultEmpHash]
        );
        console.log(`Updated ${empUpdate.affectedRows} employee records with default password (Employee123).`);

        console.log("Auth & Session Database Migration completed successfully!");
    } catch (err) {
        console.error("Migration failed:", err);
        throw err;
    }
}

// If run directly
if (process.argv[1]?.endsWith("migrate_auth.js")) {
    runAuthMigration().then(() => process.exit(0)).catch(() => process.exit(1));
}
