import pool from "../db/index.js";

/**
 * Find customer by email
 */
export const getCustomerByEmail = async (email) => {
    if (!email) return null;
    const [rows] = await pool.query(
        "SELECT cust_id, name, email, mobile_no, house_no, street, area, city, state, pincode FROM customer WHERE LOWER(TRIM(email)) = LOWER(TRIM(?)) LIMIT 1",
        [email]
    );
    return rows.length > 0 ? rows[0] : null;
};

/**
 * Create a new customer or return existing customer by email
 */
export const createOrUpdateCustomer = async (data) => {
    const email = data.email?.trim().toLowerCase();
    if (!email) throw new Error("Email is required for customer");

    const existing = await getCustomerByEmail(email);
    if (existing) {
        return existing;
    }

    const [result] = await pool.query(
        `INSERT INTO customer (name, email, mobile_no, house_no, street, area, city, state, pincode)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            data.name || "Customer",
            email,
            data.mobile || data.mobile_no || "",
            data.house_no || "",
            data.street || "",
            data.area || "",
            data.city || "Ahmedabad",
            data.state || "Gujarat",
            data.pincode || "380001"
        ]
    );

    return {
        cust_id: result.insertId,
        name: data.name || "Customer",
        email,
        mobile_no: data.mobile || data.mobile_no || "",
        house_no: data.house_no || "",
        street: data.street || "",
        area: data.area || "",
        city: data.city || "Ahmedabad",
        state: data.state || "Gujarat",
        pincode: data.pincode || "380001"
    };
};

/**
 * Fetch all registered customers
 */
export const getAllCustomers = async () => {
    const [rows] = await pool.query(
        "SELECT cust_id, name, email, mobile_no, house_no, street, area, city, state, pincode FROM customer ORDER BY cust_id ASC"
    );
    return rows;
};
