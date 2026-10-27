import pool from "../db/index.js";
import bcrypt from "bcrypt";

/**
 * Hash plain password
 */
export const hashPassword = async (password) => {
    return bcrypt.hash(password, 10);
};

/**
 * Compare plain password with stored hash
 */
export const verifyPassword = async (password, hash) => {
    if (!password || !hash) return false;
    return bcrypt.compare(password, hash);
};

/**
 * Find customer by email (including password_hash)
 */
export const findCustomerByEmail = async (email) => {
    if (!email) return null;
    const [rows] = await pool.query(
        `SELECT cust_id, name, email, password_hash, google_id, avatar_url,
                mobile_no, house_no, street, area, city, state, pincode
         FROM customer 
         WHERE LOWER(TRIM(email)) = LOWER(TRIM(?)) LIMIT 1`,
        [email]
    );
    return rows.length > 0 ? rows[0] : null;
};

/**
 * Find customer by ID (excluding password_hash by default)
 */
export const findCustomerById = async (custId) => {
    if (!custId) return null;
    const [rows] = await pool.query(
        `SELECT cust_id, name, email, google_id, avatar_url,
                mobile_no, house_no, street, area, city, state, pincode
         FROM customer 
         WHERE cust_id = ? LIMIT 1`,
        [custId]
    );
    return rows.length > 0 ? rows[0] : null;
};

/**
 * Find customer by mobile number
 */
export const findCustomerByMobile = async (mobile) => {
    if (!mobile) return null;
    const cleanMobile = String(mobile).replace(/\D/g, "");
    if (!cleanMobile) return null;

    // Search by clean 10-digit suffix or exact match
    const searchVal = cleanMobile.length >= 10 ? cleanMobile.slice(-10) : cleanMobile;
    const [rows] = await pool.query(
        `SELECT cust_id, name, email, mobile_no 
         FROM customer 
         WHERE mobile_no IS NOT NULL 
           AND TRIM(mobile_no) != ''
           AND (mobile_no = ? OR mobile_no LIKE ?) 
         LIMIT 1`,
        [cleanMobile, `%${searchVal}`]
    );
    return rows.length > 0 ? rows[0] : null;
};

/**
 * Find customer by Google ID
 */
export const findCustomerByGoogleId = async (googleId) => {
    if (!googleId) return null;
    const [rows] = await pool.query(
        `SELECT cust_id, name, email, google_id, avatar_url,
                mobile_no, house_no, street, area, city, state, pincode
         FROM customer 
         WHERE google_id = ? LIMIT 1`,
        [googleId]
    );
    return rows.length > 0 ? rows[0] : null;
};

/**
 * Create a new customer with hashed password
 */
export const createCustomer = async (data) => {
    const email = data.email?.trim().toLowerCase();
    if (!email) throw new Error("Email is required for customer registration");

    let passwordHash = null;
    if (data.password) {
        passwordHash = await hashPassword(data.password);
    }

    const [result] = await pool.query(
        `INSERT INTO customer (name, email, password_hash, google_id, avatar_url, mobile_no, house_no, street, area, city, state, pincode)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            data.name || "Customer",
            email,
            passwordHash,
            data.google_id || null,
            data.avatar_url || null,
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
        google_id: data.google_id || null,
        avatar_url: data.avatar_url || null,
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
 * Find or create/link a customer account from Google OAuth payload
 */
export const createOrUpdateGoogleCustomer = async ({ googleId, email, name, avatarUrl }) => {
    const normalizedEmail = email?.trim().toLowerCase();

    // 1. Try finding by google_id
    let customer = await findCustomerByGoogleId(googleId);
    if (customer) {
        // Update avatar or name if changed
        if (avatarUrl && avatarUrl !== customer.avatar_url) {
            await pool.query(
                "UPDATE customer SET avatar_url = ?, name = COALESCE(?, name) WHERE cust_id = ?",
                [avatarUrl, name, customer.cust_id]
            );
            customer.avatar_url = avatarUrl;
        }
        return customer;
    }

    // 2. Try finding by email
    customer = await findCustomerByEmail(normalizedEmail);
    if (customer) {
        // Link Google ID and avatar
        await pool.query(
            "UPDATE customer SET google_id = ?, avatar_url = COALESCE(avatar_url, ?) WHERE cust_id = ?",
            [googleId, avatarUrl, customer.cust_id]
        );
        customer.google_id = googleId;
        customer.avatar_url = customer.avatar_url || avatarUrl;
        return customer;
    }

    // 3. Create new customer with Google credentials
    const [result] = await pool.query(
        `INSERT INTO customer (name, email, google_id, avatar_url, mobile_no, city, state, pincode)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            name || "Google User",
            normalizedEmail,
            googleId,
            avatarUrl || null,
            "",
            "Ahmedabad",
            "Gujarat",
            "380001"
        ]
    );

    return {
        cust_id: result.insertId,
        name: name || "Google User",
        email: normalizedEmail,
        google_id: googleId,
        avatar_url: avatarUrl,
        mobile_no: "",
        city: "Ahmedabad",
        state: "Gujarat",
        pincode: "380001"
    };
};

/**
 * Find employee by email (including password_hash)
 */
export const findEmployeeByEmail = async (email) => {
    if (!email) return null;
    const [rows] = await pool.query(
        `SELECT e.emp_id, e.emp_name, e.emp_email, e.password_hash, e.emp_role, 
                e.avatar_url, e.mobile, e.salary, e.join_date, e.emp_status, 
                e.branch_id, b.branch_name
         FROM employee e
         LEFT JOIN branch b ON e.branch_id = b.branch_id
         WHERE LOWER(TRIM(e.emp_email)) = LOWER(TRIM(?)) LIMIT 1`,
        [email]
    );
    return rows.length > 0 ? rows[0] : null;
};

/**
 * Find employee by mobile number
 */
export const findEmployeeByMobile = async (mobile) => {
    if (!mobile) return null;
    const cleanMobile = String(mobile).replace(/\D/g, "");
    if (!cleanMobile) return null;

    const searchVal = cleanMobile.length >= 10 ? cleanMobile.slice(-10) : cleanMobile;
    const [rows] = await pool.query(
        `SELECT emp_id, emp_name, emp_email, mobile 
         FROM employee 
         WHERE mobile IS NOT NULL 
           AND TRIM(mobile) != ''
           AND (mobile = ? OR mobile LIKE ?) 
         LIMIT 1`,
        [cleanMobile, `%${searchVal}`]
    );
    return rows.length > 0 ? rows[0] : null;
};

/**
 * Find employee by ID (excluding password_hash)
 */
export const findEmployeeById = async (empId) => {
    if (!empId) return null;
    const [rows] = await pool.query(
        `SELECT e.emp_id, e.emp_name, e.emp_email, e.emp_role, 
                e.avatar_url, e.mobile, e.salary, e.join_date, e.emp_status, 
                e.branch_id, b.branch_name
         FROM employee e
         LEFT JOIN branch b ON e.branch_id = b.branch_id
         WHERE e.emp_id = ? LIMIT 1`,
        [empId]
    );
    return rows.length > 0 ? rows[0] : null;
};

/**
 * Create a new employee with hashed password
 */
export const createEmployee = async (data) => {
    const email = data.emp_email?.trim().toLowerCase() || data.email?.trim().toLowerCase();
    if (!email) throw new Error("Employee email is required");

    let passwordHash = null;
    if (data.password) {
        passwordHash = await hashPassword(data.password);
    }

    const [result] = await pool.query(
        `INSERT INTO employee (emp_name, emp_email, password_hash, emp_role, mobile, branch_id, emp_status, join_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`,
        [
            data.emp_name || data.name || "Employee",
            email,
            passwordHash,
            data.emp_role || "Sales Associate",
            data.mobile || "",
            data.branch_id || 1,
            data.emp_status || "Active"
        ]
    );

    return {
        emp_id: result.insertId,
        emp_name: data.emp_name || data.name || "Employee",
        emp_email: email,
        emp_role: data.emp_role || "Sales Associate",
        mobile: data.mobile || "",
        branch_id: data.branch_id || 1,
        emp_status: "Active"
    };
};
