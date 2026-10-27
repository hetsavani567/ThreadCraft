import pool from "./index.js";
import bcrypt from "bcrypt";

async function seedDemoUsers() {
    console.log("Seeding demo accounts in MySQL...");
    const empHash = await bcrypt.hash("Employee123", 10);
    const custHash = await bcrypt.hash("Customer123", 10);

    // 1. Employee demo: demo@thread.com
    const [empExist] = await pool.query("SELECT emp_id FROM employee WHERE emp_email = ?", ["demo@thread.com"]);
    if (empExist.length === 0) {
        const [res] = await pool.query(
            `INSERT INTO employee (emp_name, emp_email, password_hash, emp_role, mobile, salary, join_date, emp_status, branch_id)
             VALUES (?, ?, ?, ?, ?, ?, '2024-01-01', 'Active', 1)`,
            ["Staff Demo (Manager)", "demo@thread.com", empHash, "Branch Manager", "9876543210", 65000.00]
        );
        console.log(`Created demo employee (ID: ${res.insertId}): demo@thread.com / Employee123`);
    } else {
        await pool.query("UPDATE employee SET password_hash = ? WHERE emp_email = ?", [empHash, "demo@thread.com"]);
        console.log("Updated demo employee password to Employee123");
    }

    // 2. Customer demo: customer@demo.com
    const [custExist] = await pool.query("SELECT cust_id FROM customer WHERE email = ?", ["customer@demo.com"]);
    if (custExist.length === 0) {
        const [res] = await pool.query(
            `INSERT INTO customer (name, email, password_hash, mobile_no, house_no, street, area, city, state, pincode)
             VALUES (?, ?, ?, ?, '42', 'Fashion Boulevard', 'Navrangpura', 'Ahmedabad', 'Gujarat', '380009')`,
            ["Demo Customer", "customer@demo.com", custHash, "9876543211"]
        );
        console.log(`Created demo customer (ID: ${res.insertId}): customer@demo.com / Customer123`);
    } else {
        await pool.query("UPDATE customer SET password_hash = ? WHERE email = ?", [custHash, "customer@demo.com"]);
        console.log("Updated demo customer password to Customer123");
    }

    // 3. Make sure all other demo customer accounts have valid hashes
    await pool.query("UPDATE customer SET password_hash = ? WHERE email IN (?, ?)", [
        custHash,
        "rahul.mehta@example.com",
        "priya.shah@example.com"
    ]);
    console.log("Verified Rahul and Priya customer passwords as Customer123");

    console.log("All demo users seeded successfully!");
}

seedDemoUsers()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("Seeding error:", err);
        process.exit(1);
    });
