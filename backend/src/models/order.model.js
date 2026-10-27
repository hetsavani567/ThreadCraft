import pool from "../db/index.js";

/**
 * Fetch all orders with joined customer, branch, items, and payments
 */
export const getAllOrders = async ({ cust_id, email, status } = {}) => {
    let query = `
        SELECT 
            o.order_id,
            o.cust_id,
            COALESCE(c.name, 'Valued Customer') AS customer_name,
            c.email AS customer_email,
            c.mobile_no AS customer_mobile,
            c.house_no,
            c.street,
            c.area,
            c.city,
            c.state,
            c.pincode,
            o.branch_id,
            COALESCE(b.branch_name, 'ThreadCraft Main Hub') AS branch_name,
            b.city AS branch_city,
            DATE_FORMAT(o.order_date, '%Y-%m-%d') AS order_date,
            o.order_status,
            CAST(o.discount AS DOUBLE) AS discount,
            CAST(o.final_amount AS DOUBLE) AS final_amount,
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'variant_id', oi.variant_id,
                        'product_id', p.product_id,
                        'product_name', p.product_name,
                        'color_size', pv.color_size,
                        'image', p.Image_URL,
                        'quantity', oi.quantity,
                        'unit_price', CAST(oi.unit_price AS DOUBLE),
                        'subtotal', CAST(oi.quantity * oi.unit_price AS DOUBLE)
                    )
                )
                FROM order_item oi
                JOIN product_variant pv ON oi.variant_id = pv.variant_id
                JOIN product p ON pv.product_id = p.product_id
                WHERE oi.order_id = o.order_id
            ) AS items,
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'payment_id', pay.payment_id,
                        'amount', CAST(pay.amount AS DOUBLE),
                        'method', pay.method,
                        'payment_status', pay.payment_status,
                        'payment_datetime', DATE_FORMAT(pay.payment_datetime, '%Y-%m-%d %H:%i:%s')
                    )
                )
                FROM payment pay
                WHERE pay.order_id = o.order_id
            ) AS payments
        FROM orders o
        LEFT JOIN customer c ON o.cust_id = c.cust_id
        LEFT JOIN branch b ON o.branch_id = b.branch_id
        WHERE 1=1
    `;

    const params = [];

    if (cust_id) {
        query += " AND o.cust_id = ?";
        params.push(cust_id);
    }

    if (email) {
        query += " AND LOWER(c.email) = LOWER(?)";
        params.push(email);
    }

    if (status && status !== "All") {
        query += " AND LOWER(o.order_status) = LOWER(?)";
        params.push(status);
    }

    query += " ORDER BY o.order_id DESC";

    const [rows] = await pool.query(query, params);
    return rows;
};

/**
 * Fetch a single order by ID with full item details & payment records
 */
export const getOrderById = async (orderId) => {
    const query = `
        SELECT 
            o.order_id,
            o.cust_id,
            COALESCE(c.name, 'Valued Customer') AS customer_name,
            c.email AS customer_email,
            c.mobile_no AS customer_mobile,
            c.house_no,
            c.street,
            c.area,
            c.city,
            c.state,
            c.pincode,
            o.branch_id,
            COALESCE(b.branch_name, 'ThreadCraft Main Hub') AS branch_name,
            b.city AS branch_city,
            DATE_FORMAT(o.order_date, '%Y-%m-%d') AS order_date,
            o.order_status,
            CAST(o.discount AS DOUBLE) AS discount,
            CAST(o.final_amount AS DOUBLE) AS final_amount,
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'variant_id', oi.variant_id,
                        'product_id', p.product_id,
                        'product_name', p.product_name,
                        'color_size', pv.color_size,
                        'image', p.Image_URL,
                        'quantity', oi.quantity,
                        'unit_price', CAST(oi.unit_price AS DOUBLE),
                        'subtotal', CAST(oi.quantity * oi.unit_price AS DOUBLE)
                    )
                )
                FROM order_item oi
                JOIN product_variant pv ON oi.variant_id = pv.variant_id
                JOIN product p ON pv.product_id = p.product_id
                WHERE oi.order_id = o.order_id
            ) AS items,
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'payment_id', pay.payment_id,
                        'amount', CAST(pay.amount AS DOUBLE),
                        'method', pay.method,
                        'payment_status', pay.payment_status,
                        'payment_datetime', DATE_FORMAT(pay.payment_datetime, '%Y-%m-%d %H:%i:%s')
                    )
                )
                FROM payment pay
                WHERE pay.order_id = o.order_id
            ) AS payments
        FROM orders o
        LEFT JOIN customer c ON o.cust_id = c.cust_id
        LEFT JOIN branch b ON o.branch_id = b.branch_id
        WHERE o.order_id = ?
    `;

    const [rows] = await pool.query(query, [orderId]);
    return rows[0] || null;
};

/**
 * Create a new order along with customer resolution, order items, and payment
 */
export const createOrder = async (orderData) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        let customerId = orderData.cust_id;
        const shipping = orderData.shipping || {};
        const email = orderData.email || shipping.email;

        // 1. Resolve or create customer if needed
        if (!customerId && email) {
            const [custRows] = await connection.query(
                "SELECT cust_id FROM customer WHERE LOWER(email) = LOWER(?) LIMIT 1",
                [email]
            );
            if (custRows.length > 0) {
                customerId = custRows[0].cust_id;
            } else {
                const [newCustResult] = await connection.query(
                    `INSERT INTO customer (name, email, mobile_no, house_no, street, area, city, state, pincode)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        shipping.fullName || orderData.name || "Customer",
                        email,
                        shipping.mobile || "",
                        shipping.houseNo || "",
                        shipping.street || "",
                        shipping.area || "",
                        shipping.city || "Ahmedabad",
                        shipping.state || "Gujarat",
                        shipping.pincode || "380001"
                    ]
                );
                customerId = newCustResult.insertId;
            }
        }

        // Default to first customer if none found/provided
        if (!customerId) {
            const [firstCust] = await connection.query("SELECT cust_id FROM customer LIMIT 1");
            customerId = firstCust.length > 0 ? firstCust[0].cust_id : 1;
        }

        const branchId = orderData.branch_id || 1;
        const discount = Number(orderData.discount) || 0;
        const finalAmount = Number(orderData.final_amount || orderData.amount) || 0;

        // 2. Insert into orders table
        const [orderResult] = await connection.query(
            `INSERT INTO orders (cust_id, branch_id, order_date, order_status, discount, final_amount)
             VALUES (?, ?, CURDATE(), 'Placed', ?, ?)`,
            [customerId, branchId, discount, finalAmount]
        );
        const orderId = orderResult.insertId;

        // 3. Insert order items
        if (Array.isArray(orderData.items) && orderData.items.length > 0) {
            for (const item of orderData.items) {
                let variantId = item.variant_id || item.selectedVariant?.variant_id;

                // Fallback: If variantId is not numeric or missing, find a valid variant for this product
                if (!variantId || isNaN(Number(variantId))) {
                    const productId = item.id || item.product_id;
                    if (productId) {
                        const [vRows] = await connection.query(
                            "SELECT variant_id FROM product_variant WHERE product_id = ? LIMIT 1",
                            [productId]
                        );
                        if (vRows.length > 0) {
                            variantId = vRows[0].variant_id;
                        }
                    }
                }

                // Global fallback to first variant in database
                if (!variantId || isNaN(Number(variantId))) {
                    const [vDefault] = await connection.query("SELECT variant_id FROM product_variant LIMIT 1");
                    variantId = vDefault.length > 0 ? vDefault[0].variant_id : 1;
                }

                const quantity = Math.max(1, Number(item.quantity) || 1);
                const unitPrice = Number(item.price) || 0;

                await connection.query(
                    `INSERT INTO order_item (order_id, variant_id, quantity, unit_price)
                     VALUES (?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
                    [orderId, variantId, quantity, unitPrice]
                );
            }
        }

        // 4. Insert payment record
        const paymentMethod = orderData.paymentMethod || orderData.method || "Card";
        await connection.query(
            `INSERT INTO payment (order_id, amount, method, payment_status, payment_datetime)
             VALUES (?, ?, ?, 'Paid', NOW())`,
            [orderId, finalAmount, paymentMethod]
        );

        await connection.commit();

        // 5. Return full populated order
        return await getOrderById(orderId);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Update the tracking status of an order
 */
export const updateOrderStatus = async (orderId, status) => {
    const validStatuses = ["Placed", "Packed", "Shipped", "Delivered", "Cancelled"];
    const normalized = validStatuses.find(
        (s) => s.toLowerCase() === (status || "").trim().toLowerCase()
    ) || status;

    await pool.query(
        "UPDATE orders SET order_status = ? WHERE order_id = ?",
        [normalized, orderId]
    );

    return await getOrderById(orderId);
};
