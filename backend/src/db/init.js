import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config();

export const initializeDatabase = async () => {
    const host = process.env.DB_HOST || "localhost";
    const port = Number(process.env.DB_PORT) || 3306;
    const user = process.env.DB_USER || "root";
    const password = process.env.DB_PASSWORD || "";
    const dbName = process.env.DB_NAME || "retail_db";

    console.log(`\n=================================================`);
    console.log(` ThreadCraft — MySQL Database Setup`);
    console.log(`=================================================`);
    console.log(`Host:     ${host}:${port}`);
    console.log(`User:     ${user}`);
    console.log(`Database: ${dbName}`);
    console.log(`-------------------------------------------------`);

    let connection;
    try {
        console.log(`Connecting to MySQL server...`);
        connection = await mysql.createConnection({
            host,
            port,
            user,
            password,
            multipleStatements: true,
            ssl: (process.env.DB_SSL === "true" || host.includes("tidbcloud.com"))
                ? { minVersion: "TLSv1.2", rejectUnauthorized: true }
                : undefined
        });

        console.log(`Connected to MySQL server successfully.`);

        // 1. Read schema and sample data SQL files
        const schemaPath = path.resolve(__dirname, "../../../database/schema.sql");
        const sampleDataPath = path.resolve(__dirname, "../../../database/sample_data.sql");

        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Schema file not found at ${schemaPath}`);
        }
        if (!fs.existsSync(sampleDataPath)) {
            throw new Error(`Sample data file not found at ${sampleDataPath}`);
        }

        const schemaSql = fs.readFileSync(schemaPath, "utf-8");
        const sampleDataSql = fs.readFileSync(sampleDataPath, "utf-8");

        // 2. Execute schema.sql
        console.log(`Executing database/schema.sql (creating tables and views)...`);
        await connection.query(schemaSql);
        console.log(`Schema created successfully.`);

        // 3. Execute sample_data.sql
        console.log(`Executing database/sample_data.sql (seeding sample records)...`);
        await connection.query(sampleDataSql);
        console.log(`Sample data seeded successfully.`);

        // 4. Verify table counts
        await connection.query(`USE \`${dbName}\`;`);
        const [tables] = await connection.query(`SHOW TABLES;`);
        const [productCount] = await connection.query(`SELECT COUNT(*) AS total FROM product;`);
        const [categoryCount] = await connection.query(`SELECT COUNT(*) AS total FROM category;`);
        const [brandCount] = await connection.query(`SELECT COUNT(*) AS total FROM brand;`);

        console.log(`\nVerification:`);
        console.log(`  - Total Tables:    ${tables.length}`);
        console.log(`  - Categories:      ${categoryCount[0].total}`);
        console.log(`  - Brands:          ${brandCount[0].total}`);
        console.log(`  - Products:        ${productCount[0].total}`);
        console.log(`\nDatabase '${dbName}' is ready for ThreadCraft!\n`);

        return true;
    } catch (err) {
        console.error(`\nDatabase Initialization Failed:`);
        if (err.code === "ECONNREFUSED" || (err.errors && err.errors.some(e => e.code === "ECONNREFUSED" || e.code === "EACCES"))) {
            console.error(`Cannot connect to MySQL on ${host}:${port}.`);
            console.error(`- If MySQL is installed as a Windows service, start it:`);
            console.error(`    net start MySQL80   (Run in Administrator terminal)`);
            console.error(`- If using XAMPP, open XAMPP Control Panel and start MySQL.`);
        } else if (err.code === "ER_ACCESS_DENIED_ERROR") {
            console.error(`Access denied for user '${user}'.`);
            console.error(`- Please check your DB_PASSWORD in backend/.env.`);
        } else {
            console.error(err.message || err);
        }
        return false;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

// If run directly from terminal
if (process.argv[1] && process.argv[1].endsWith("init.js")) {
    initializeDatabase().then((success) => {
        process.exit(success ? 0 : 1);
    });
}
