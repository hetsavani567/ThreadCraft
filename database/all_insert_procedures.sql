USE retail_db;

-- =====================================================================
-- COMPLETE INSERT STORED PROCEDURES FOR ALL THREADCRAFT TABLES
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. CATEGORY: sp_insert_category
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_insert_category;

DELIMITER //

CREATE PROCEDURE sp_insert_category(
    IN p_category_type VARCHAR(100),
    IN p_description VARCHAR(255),
    OUT p_new_category_id INT
)
BEGIN
    IF p_category_type IS NULL OR TRIM(p_category_type) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Category type cannot be empty.';
    END IF;

    IF (SELECT COUNT(*) FROM category WHERE LOWER(category_type) = LOWER(TRIM(p_category_type))) > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Category already exists.';
    END IF;

    INSERT INTO category (category_type, description)
    VALUES (TRIM(p_category_type), p_description);

    SET p_new_category_id = LAST_INSERT_ID();

    SELECT p_new_category_id AS category_id, 'Category inserted successfully' AS status;
END //

DELIMITER ;

-- ---------------------------------------------------------------------
-- 2. BRAND: sp_insert_brand
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_insert_brand;

DELIMITER //

CREATE PROCEDURE sp_insert_brand(
    IN p_brand_name VARCHAR(100),
    IN p_description VARCHAR(255),
    IN p_web_site VARCHAR(255),
    OUT p_new_brand_id INT
)
BEGIN
    IF p_brand_name IS NULL OR TRIM(p_brand_name) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Brand name cannot be empty.';
    END IF;

    IF (SELECT COUNT(*) FROM brand WHERE LOWER(brand_name) = LOWER(TRIM(p_brand_name))) > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Brand already exists.';
    END IF;

    INSERT INTO brand (brand_name, description, web_site)
    VALUES (TRIM(p_brand_name), p_description, p_web_site);

    SET p_new_brand_id = LAST_INSERT_ID();

    SELECT p_new_brand_id AS brand_id, 'Brand inserted successfully' AS status;
END //

DELIMITER ;

-- ---------------------------------------------------------------------
-- 3. BRANCH: sp_insert_branch
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_insert_branch;

DELIMITER //

CREATE PROCEDURE sp_insert_branch(
    IN p_branch_name VARCHAR(100),
    IN p_phone VARCHAR(15),
    IN p_house_no VARCHAR(20),
    IN p_street VARCHAR(100),
    IN p_area VARCHAR(100),
    IN p_city VARCHAR(50),
    IN p_state VARCHAR(50),
    IN p_pincode CHAR(6),
    OUT p_new_branch_id INT
)
BEGIN
    IF p_branch_name IS NULL OR TRIM(p_branch_name) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Branch name cannot be empty.';
    END IF;

    IF p_phone IS NULL OR TRIM(p_phone) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Phone number cannot be empty.';
    END IF;

    INSERT INTO branch (branch_name, phone, is_active, house_no, street, area, city, state, pincode)
    VALUES (TRIM(p_branch_name), TRIM(p_phone), 1, p_house_no, p_street, p_area, p_city, p_state, p_pincode);

    SET p_new_branch_id = LAST_INSERT_ID();

    SELECT p_new_branch_id AS branch_id, 'Branch inserted successfully' AS status;
END //

DELIMITER ;

-- ---------------------------------------------------------------------
-- 4. SUPPLIER: sp_insert_supplier
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_insert_supplier;

DELIMITER //

CREATE PROCEDURE sp_insert_supplier(
    IN p_supplier_name VARCHAR(100),
    IN p_gst VARCHAR(15),
    IN p_mobile_no VARCHAR(15),
    IN p_email VARCHAR(100),
    IN p_house_no VARCHAR(20),
    IN p_street VARCHAR(100),
    IN p_area VARCHAR(100),
    IN p_city VARCHAR(50),
    IN p_state VARCHAR(50),
    IN p_pincode CHAR(6),
    OUT p_new_supplier_id INT
)
BEGIN
    IF p_supplier_name IS NULL OR TRIM(p_supplier_name) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Supplier name cannot be empty.';
    END IF;

    IF p_gst IS NOT NULL AND (SELECT COUNT(*) FROM supplier WHERE gst = p_gst) > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: GST number already registered.';
    END IF;

    IF p_email IS NOT NULL AND (SELECT COUNT(*) FROM supplier WHERE email = p_email) > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Email already registered.';
    END IF;

    INSERT INTO supplier (supplier_name, gst, mobile_no, email, house_no, street, area, city, state, pincode)
    VALUES (TRIM(p_supplier_name), p_gst, p_mobile_no, p_email, p_house_no, p_street, p_area, p_city, p_state, p_pincode);

    SET p_new_supplier_id = LAST_INSERT_ID();

    SELECT p_new_supplier_id AS supplier_id, 'Supplier inserted successfully' AS status;
END //

DELIMITER ;

-- ---------------------------------------------------------------------
-- 5. EMPLOYEE: sp_insert_employee
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_insert_employee;

DELIMITER //

CREATE PROCEDURE sp_insert_employee(
    IN p_emp_name VARCHAR(100),
    IN p_mobile VARCHAR(15),
    IN p_emp_email VARCHAR(100),
    IN p_emp_role VARCHAR(50),
    IN p_salary DECIMAL(10,2),
    IN p_join_date DATE,
    IN p_emp_status VARCHAR(20),
    IN p_branch_id INT,
    OUT p_new_emp_id INT
)
BEGIN
    IF (SELECT COUNT(*) FROM branch WHERE branch_id = p_branch_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Invalid branch_id. Branch does not exist.';
    END IF;

    IF p_salary < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Salary cannot be negative.';
    END IF;

    IF p_emp_email IS NOT NULL AND (SELECT COUNT(*) FROM employee WHERE emp_email = p_emp_email) > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Employee email already exists.';
    END IF;

    INSERT INTO employee (emp_name, mobile, emp_email, emp_role, salary, join_date, emp_status, branch_id)
    VALUES (TRIM(p_emp_name), p_mobile, p_emp_email, p_emp_role, p_salary, COALESCE(p_join_date, CURDATE()), COALESCE(p_emp_status, 'Active'), p_branch_id);

    SET p_new_emp_id = LAST_INSERT_ID();

    SELECT p_new_emp_id AS emp_id, 'Employee inserted successfully' AS status;
END //

DELIMITER ;

-- ---------------------------------------------------------------------
-- 6. CUSTOMER: sp_insert_customer
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_insert_customer;

DELIMITER //

CREATE PROCEDURE sp_insert_customer(
    IN p_name VARCHAR(100),
    IN p_email VARCHAR(100),
    IN p_mobile_no VARCHAR(15),
    IN p_house_no VARCHAR(20),
    IN p_street VARCHAR(100),
    IN p_area VARCHAR(100),
    IN p_city VARCHAR(50),
    IN p_state VARCHAR(50),
    IN p_pincode CHAR(6),
    OUT p_new_cust_id INT
)
BEGIN
    IF p_name IS NULL OR TRIM(p_name) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Customer name cannot be empty.';
    END IF;

    IF p_email IS NOT NULL AND (SELECT COUNT(*) FROM customer WHERE email = p_email) > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Customer with this email already exists.';
    END IF;

    INSERT INTO customer (name, email, mobile_no, house_no, street, area, city, state, pincode)
    VALUES (TRIM(p_name), p_email, p_mobile_no, p_house_no, p_street, p_area, p_city, p_state, p_pincode);

    SET p_new_cust_id = LAST_INSERT_ID();

    SELECT p_new_cust_id AS cust_id, 'Customer registered successfully' AS status;
END //

DELIMITER ;

-- ---------------------------------------------------------------------
-- 7. INVENTORY: sp_insert_inventory
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_insert_inventory;

DELIMITER //

CREATE PROCEDURE sp_insert_inventory(
    IN p_variant_id INT,
    IN p_branch_id INT,
    IN p_quantity INT,
    IN p_reorder_level INT,
    OUT p_new_inv_id INT
)
BEGIN
    IF (SELECT COUNT(*) FROM product_variant WHERE variant_id = p_variant_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Invalid variant_id. Variant does not exist.';
    END IF;

    IF (SELECT COUNT(*) FROM branch WHERE branch_id = p_branch_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Invalid branch_id. Branch does not exist.';
    END IF;

    IF p_quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Quantity cannot be negative.';
    END IF;

    -- If record exists for this variant + branch, update it; otherwise insert
    INSERT INTO inventory (variant_id, branch_id, quantity, reorder_level)
    VALUES (p_variant_id, p_branch_id, p_quantity, COALESCE(p_reorder_level, 10))
    ON DUPLICATE KEY UPDATE 
        quantity = quantity + p_quantity,
        reorder_level = COALESCE(p_reorder_level, reorder_level);

    SET p_new_inv_id = LAST_INSERT_ID();

    SELECT p_new_inv_id AS inventory_id, 'Inventory recorded successfully' AS status;
END //

DELIMITER ;

-- ---------------------------------------------------------------------
-- 8. ORDERS: sp_insert_order
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_insert_order;

DELIMITER //

CREATE PROCEDURE sp_insert_order(
    IN p_cust_id INT,
    IN p_branch_id INT,
    IN p_order_date DATE,
    IN p_discount DECIMAL(10,2),
    IN p_final_amount DECIMAL(12,2),
    OUT p_new_order_id INT
)
BEGIN
    IF (SELECT COUNT(*) FROM customer WHERE cust_id = p_cust_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Customer ID does not exist.';
    END IF;

    IF (SELECT COUNT(*) FROM branch WHERE branch_id = p_branch_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Branch ID does not exist.';
    END IF;

    IF p_final_amount < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Final amount cannot be negative.';
    END IF;

    INSERT INTO orders (cust_id, branch_id, order_date, order_status, discount, final_amount)
    VALUES (p_cust_id, p_branch_id, COALESCE(p_order_date, CURDATE()), 'Pending', COALESCE(p_discount, 0), p_final_amount);

    SET p_new_order_id = LAST_INSERT_ID();

    SELECT p_new_order_id AS order_id, 'Order created successfully' AS status;
END //

DELIMITER ;

-- ---------------------------------------------------------------------
-- 9. PAYMENT: sp_insert_payment
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_insert_payment;

DELIMITER //

CREATE PROCEDURE sp_insert_payment(
    IN p_order_id INT,
    IN p_amount DECIMAL(12,2),
    IN p_method VARCHAR(30),
    IN p_payment_status VARCHAR(20),
    OUT p_new_payment_id INT
)
BEGIN
    IF (SELECT COUNT(*) FROM orders WHERE order_id = p_order_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Order ID does not exist.';
    END IF;

    IF p_amount <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Payment amount must be greater than zero.';
    END IF;

    INSERT INTO payment (order_id, amount, method, payment_status, payment_datetime)
    VALUES (p_order_id, p_amount, p_method, COALESCE(p_payment_status, 'Completed'), NOW());

    SET p_new_payment_id = LAST_INSERT_ID();

    -- If payment completed, update order status
    IF LOWER(p_payment_status) = 'completed' THEN
        UPDATE orders SET order_status = 'Completed' WHERE order_id = p_order_id;
    END IF;

    SELECT p_new_payment_id AS payment_id, 'Payment processed successfully' AS status;
END //

DELIMITER ;

-- ---------------------------------------------------------------------
-- 10. REVIEW: sp_insert_review
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_insert_review;

DELIMITER //

CREATE PROCEDURE sp_insert_review(
    IN p_product_id INT,
    IN p_cust_id INT,
    IN p_rating TINYINT,
    IN p_comments TEXT,
    OUT p_new_review_id INT
)
BEGIN
    IF (SELECT COUNT(*) FROM product WHERE product_id = p_product_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Product ID does not exist.';
    END IF;

    IF (SELECT COUNT(*) FROM customer WHERE cust_id = p_cust_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Customer ID does not exist.';
    END IF;

    IF p_rating < 1 OR p_rating > 5 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Rating must be between 1 and 5.';
    END IF;

    INSERT INTO review (product_id, cust_id, review_date, rating, comments)
    VALUES (p_product_id, p_cust_id, CURDATE(), p_rating, p_comments);

    SET p_new_review_id = LAST_INSERT_ID();

    SELECT p_new_review_id AS review_id, 'Review submitted successfully' AS status;
END //

DELIMITER ;

-- ---------------------------------------------------------------------
-- 11. BRANCH_SUPPLIER: sp_insert_branch_supplier
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_insert_branch_supplier;

DELIMITER //

CREATE PROCEDURE sp_insert_branch_supplier(
    IN p_branch_id INT,
    IN p_supplier_id INT
)
BEGIN
    IF (SELECT COUNT(*) FROM branch WHERE branch_id = p_branch_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Invalid branch_id. Branch does not exist.';
    END IF;

    IF (SELECT COUNT(*) FROM supplier WHERE supplier_id = p_supplier_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Invalid supplier_id. Supplier does not exist.';
    END IF;

    IF (SELECT COUNT(*) FROM branch_supplier WHERE branch_id = p_branch_id AND supplier_id = p_supplier_id) > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Branch is already mapped to this supplier.';
    END IF;

    INSERT INTO branch_supplier (branch_id, supplier_id)
    VALUES (p_branch_id, p_supplier_id);

    SELECT p_branch_id AS branch_id, p_supplier_id AS supplier_id, 'Branch-Supplier mapping added successfully' AS status;
END //

DELIMITER ;

-- ---------------------------------------------------------------------
-- 12. ORDER_ITEM: sp_insert_order_item
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_insert_order_item;

DELIMITER //

CREATE PROCEDURE sp_insert_order_item(
    IN p_order_id INT,
    IN p_variant_id INT,
    IN p_quantity INT,
    IN p_unit_price DECIMAL(10,2)
)
BEGIN
    IF (SELECT COUNT(*) FROM orders WHERE order_id = p_order_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Order ID does not exist.';
    END IF;

    IF (SELECT COUNT(*) FROM product_variant WHERE variant_id = p_variant_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Variant ID does not exist.';
    END IF;

    IF p_quantity <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Quantity must be greater than zero.';
    END IF;

    IF p_unit_price < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Unit price cannot be negative.';
    END IF;

    INSERT INTO order_item (order_id, variant_id, quantity, unit_price)
    VALUES (p_order_id, p_variant_id, p_quantity, p_unit_price)
    ON DUPLICATE KEY UPDATE 
        quantity = quantity + p_quantity,
        unit_price = p_unit_price;

    SELECT p_order_id AS order_id, p_variant_id AS variant_id, 'Order item added successfully' AS status;
END //

DELIMITER ;

-- ---------------------------------------------------------------------
-- 13. PRODUCT_RETURN: sp_insert_product_return
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_insert_product_return;

DELIMITER //

CREATE PROCEDURE sp_insert_product_return(
    IN p_order_id INT,
    IN p_variant_id INT,
    IN p_quantity INT,
    IN p_reason VARCHAR(255),
    IN p_return_status VARCHAR(20),
    OUT p_new_return_id INT
)
BEGIN
    IF (SELECT COUNT(*) FROM order_item WHERE order_id = p_order_id AND variant_id = p_variant_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: This variant was not part of the specified order.';
    END IF;

    IF p_quantity <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Return quantity must be greater than zero.';
    END IF;

    INSERT INTO product_return (order_id, variant_id, quantity, reason, return_datetime, return_status)
    VALUES (p_order_id, p_variant_id, p_quantity, p_reason, NOW(), COALESCE(p_return_status, 'Requested'));

    SET p_new_return_id = LAST_INSERT_ID();

    SELECT p_new_return_id AS return_id, 'Product return recorded successfully' AS status;
END //

DELIMITER ;

-- ---------------------------------------------------------------------
-- 14. PURCHASE: sp_insert_purchase
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_insert_purchase;

DELIMITER //

CREATE PROCEDURE sp_insert_purchase(
    IN p_supplier_id INT,
    IN p_emp_id INT,
    IN p_branch_id INT,
    IN p_purchase_date DATE,
    IN p_total_amount DECIMAL(12,2),
    OUT p_new_purchase_id INT
)
BEGIN
    IF (SELECT COUNT(*) FROM supplier WHERE supplier_id = p_supplier_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Supplier ID does not exist.';
    END IF;

    IF (SELECT COUNT(*) FROM employee WHERE emp_id = p_emp_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Employee ID does not exist.';
    END IF;

    IF (SELECT COUNT(*) FROM branch WHERE branch_id = p_branch_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Branch ID does not exist.';
    END IF;

    IF p_total_amount < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Total amount cannot be negative.';
    END IF;

    INSERT INTO purchase (supplier_id, emp_id, branch_id, purchase_date, total_amount)
    VALUES (p_supplier_id, p_emp_id, p_branch_id, COALESCE(p_purchase_date, CURDATE()), p_total_amount);

    SET p_new_purchase_id = LAST_INSERT_ID();

    SELECT p_new_purchase_id AS purchase_id, 'Purchase order created successfully' AS status;
END //

DELIMITER ;

-- ---------------------------------------------------------------------
-- 15. PURCHASE_ITEM: sp_insert_purchase_item
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_insert_purchase_item;

DELIMITER //

CREATE PROCEDURE sp_insert_purchase_item(
    IN p_purchase_id INT,
    IN p_variant_id INT,
    IN p_quantity INT,
    IN p_unit_cost DECIMAL(10,2)
)
BEGIN
    IF (SELECT COUNT(*) FROM purchase WHERE purchase_id = p_purchase_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Purchase ID does not exist.';
    END IF;

    IF (SELECT COUNT(*) FROM product_variant WHERE variant_id = p_variant_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Variant ID does not exist.';
    END IF;

    IF p_quantity <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Purchase quantity must be greater than zero.';
    END IF;

    IF p_unit_cost < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Unit cost cannot be negative.';
    END IF;

    INSERT INTO purchase_item (purchase_id, variant_id, quantity, unit_cost)
    VALUES (p_purchase_id, p_variant_id, p_quantity, p_unit_cost)
    ON DUPLICATE KEY UPDATE 
        quantity = quantity + p_quantity,
        unit_cost = p_unit_cost;

    SELECT p_purchase_id AS purchase_id, p_variant_id AS variant_id, 'Purchase item recorded successfully' AS status;
END //

DELIMITER ;

-- ---------------------------------------------------------------------
-- 16. PRODUCT : sp_insert_product
-- ---------------------------------------------------------------------

DROP PROCEDURE IF EXISTS sp_insert_product;

DELIMITER //

CREATE PROCEDURE sp_insert_product(
    IN p_category_id INT,
    IN p_brand_id INT,
    IN p_product_name VARCHAR(150),
    IN p_product_description VARCHAR(500),
    IN p_image_url TEXT,
    OUT p_new_product_id INT
)
BEGIN
    -- 1. Validate Category exists
    IF (SELECT COUNT(*) FROM category WHERE category_id = p_category_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Invalid category_id. Category does not exist.';
    END IF;

    -- 2. Validate Brand exists
    IF (SELECT COUNT(*) FROM brand WHERE brand_id = p_brand_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Invalid brand_id. Brand does not exist.';
    END IF;

    -- 3. Perform Insertion
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

    -- 5. Capture generated ID
    SET p_new_product_id = LAST_INSERT_ID();

    SELECT 
        p_new_product_id AS inserted_product_id,
        'Product inserted successfully' AS status;
END //

DELIMITER ;

-- ---------------------------------------------------------------------
-- 17. PRODUCT_VARIANT: sp_insert_product_variant
-- ---------------------------------------------------------------------

DROP PROCEDURE IF EXISTS sp_add_product_variant;

DELIMITER //

CREATE PROCEDURE sp_add_product_variant(
    IN p_product_id INT,
    IN p_color_size VARCHAR(50),
    IN p_selling_price DECIMAL(10,2),
    IN p_initial_stock INT,
    IN p_discount_percent INT,
    OUT p_new_variant_id INT
)
BEGIN
    -- 1. Validate Product exists
    IF (SELECT COUNT(*) FROM product WHERE product_id = p_product_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Product ID does not exist.';
    END IF;

    -- 2. Validate Color and Size input
    IF p_color_size IS NULL OR TRIM(p_color_size) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Color and Size cannot be empty.';
    END IF;

    -- 3. Validate Selling Price
    IF p_selling_price <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Selling price must be greater than zero.';
    END IF;

    -- 4. Check for duplicate variant for the same product
    IF (SELECT COUNT(*) FROM product_variant WHERE product_id = p_product_id AND color_size = p_color_size) > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Variant with this color/size already exists for this product.';
    END IF;

    -- 5. Insert into product_variant
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

    -- 6. Optional: Add initial stock to branch 1 inventory
    IF p_initial_stock IS NOT NULL AND p_initial_stock > 0 THEN
        INSERT INTO inventory (branch_id, variant_id, quantity)
        VALUES (1, p_new_variant_id, p_initial_stock);
    END IF;

    SELECT 
        p_new_variant_id AS variant_id,
        p_product_id AS product_id,
        p_color_size AS color_size,
        p_selling_price AS selling_price,
        COALESCE(p_initial_stock, 0) AS added_stock,
        'Product variant added successfully' AS status;
END //

DELIMITER ;