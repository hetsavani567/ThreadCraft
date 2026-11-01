USE retail_db;

-- =====================================================================
-- COMPLETE UPDATE STORED PROCEDURES FOR ALL THREADCRAFT TABLES (17 Tables)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. CATEGORY: sp_update_category
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_update_category;
DELIMITER //
CREATE PROCEDURE sp_update_category(
    IN p_category_id INT,
    IN p_category_type VARCHAR(100),
    IN p_description VARCHAR(255)
)
BEGIN
    IF (SELECT COUNT(*) FROM category WHERE category_id = p_category_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Category ID does not exist.';
    END IF;

    IF p_category_type IS NULL OR TRIM(p_category_type) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Category type cannot be empty.';
    END IF;

    UPDATE category
    SET category_type = TRIM(p_category_type),
        description = p_description
    WHERE category_id = p_category_id;

    SELECT p_category_id AS updated_category_id, 'Category updated successfully' AS status;
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 2. BRAND: sp_update_brand
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_update_brand;
DELIMITER //
CREATE PROCEDURE sp_update_brand(
    IN p_brand_id INT,
    IN p_brand_name VARCHAR(100),
    IN p_description VARCHAR(255),
    IN p_web_site VARCHAR(255)
)
BEGIN
    IF (SELECT COUNT(*) FROM brand WHERE brand_id = p_brand_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Brand ID does not exist.';
    END IF;

    IF p_brand_name IS NULL OR TRIM(p_brand_name) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Brand name cannot be empty.';
    END IF;

    UPDATE brand
    SET brand_name = TRIM(p_brand_name),
        description = p_description,
        web_site = p_web_site
    WHERE brand_id = p_brand_id;

    SELECT p_brand_id AS updated_brand_id, 'Brand updated successfully' AS status;
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 3. PRODUCT: sp_update_product
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_update_product;
DELIMITER //
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
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 4. PRODUCT_VARIANT: sp_update_product_variant
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_update_product_variant;
DELIMITER //
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
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 5. BRANCH: sp_update_branch
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_update_branch;
DELIMITER //
CREATE PROCEDURE sp_update_branch(
    IN p_branch_id INT,
    IN p_branch_name VARCHAR(100),
    IN p_phone VARCHAR(15),
    IN p_is_active BOOLEAN,
    IN p_house_no VARCHAR(20),
    IN p_street VARCHAR(100),
    IN p_area VARCHAR(100),
    IN p_city VARCHAR(50),
    IN p_state VARCHAR(50),
    IN p_pincode CHAR(6)
)
BEGIN
    IF (SELECT COUNT(*) FROM branch WHERE branch_id = p_branch_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Branch ID does not exist.';
    END IF;

    UPDATE branch
    SET branch_name = TRIM(p_branch_name),
        phone = TRIM(p_phone),
        is_active = COALESCE(p_is_active, 1),
        house_no = p_house_no,
        street = p_street,
        area = p_area,
        city = p_city,
        state = p_state,
        pincode = p_pincode
    WHERE branch_id = p_branch_id;

    SELECT p_branch_id AS updated_branch_id, 'Branch updated successfully' AS status;
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 6. SUPPLIER: sp_update_supplier
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_update_supplier;
DELIMITER //
CREATE PROCEDURE sp_update_supplier(
    IN p_supplier_id INT,
    IN p_supplier_name VARCHAR(100),
    IN p_gst VARCHAR(15),
    IN p_mobile_no VARCHAR(15),
    IN p_email VARCHAR(100),
    IN p_house_no VARCHAR(20),
    IN p_street VARCHAR(100),
    IN p_area VARCHAR(100),
    IN p_city VARCHAR(50),
    IN p_state VARCHAR(50),
    IN p_pincode CHAR(6)
)
BEGIN
    IF (SELECT COUNT(*) FROM supplier WHERE supplier_id = p_supplier_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Supplier ID does not exist.';
    END IF;

    UPDATE supplier
    SET supplier_name = TRIM(p_supplier_name),
        gst = p_gst,
        mobile_no = p_mobile_no,
        email = p_email,
        house_no = p_house_no,
        street = p_street,
        area = p_area,
        city = p_city,
        state = p_state,
        pincode = p_pincode
    WHERE supplier_id = p_supplier_id;

    SELECT p_supplier_id AS updated_supplier_id, 'Supplier updated successfully' AS status;
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 7. BRANCH_SUPPLIER: sp_update_branch_supplier
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_update_branch_supplier;
DELIMITER //
CREATE PROCEDURE sp_update_branch_supplier(
    IN p_old_branch_id INT,
    IN p_old_supplier_id INT,
    IN p_new_branch_id INT,
    IN p_new_supplier_id INT
)
BEGIN
    IF (SELECT COUNT(*) FROM branch_supplier WHERE branch_id = p_old_branch_id AND supplier_id = p_old_supplier_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Existing branch-supplier relation not found.';
    END IF;

    UPDATE branch_supplier
    SET branch_id = p_new_branch_id,
        supplier_id = p_new_supplier_id
    WHERE branch_id = p_old_branch_id AND supplier_id = p_old_supplier_id;

    SELECT 'Branch-Supplier mapping updated successfully' AS status;
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 8. EMPLOYEE: sp_update_employee
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_update_employee;
DELIMITER //
CREATE PROCEDURE sp_update_employee(
    IN p_emp_id INT,
    IN p_emp_name VARCHAR(100),
    IN p_mobile VARCHAR(15),
    IN p_emp_email VARCHAR(100),
    IN p_emp_role VARCHAR(50),
    IN p_salary DECIMAL(10,2),
    IN p_emp_status VARCHAR(20),
    IN p_branch_id INT
)
BEGIN
    IF (SELECT COUNT(*) FROM employee WHERE emp_id = p_emp_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Employee ID does not exist.';
    END IF;

    IF p_salary < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Salary cannot be negative.';
    END IF;

    UPDATE employee
    SET emp_name = TRIM(p_emp_name),
        mobile = p_mobile,
        emp_email = p_emp_email,
        emp_role = p_emp_role,
        salary = p_salary,
        emp_status = p_emp_status,
        branch_id = p_branch_id
    WHERE emp_id = p_emp_id;

    SELECT p_emp_id AS updated_emp_id, 'Employee updated successfully' AS status;
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 9. INVENTORY: sp_update_inventory_stock
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_update_inventory_stock;
DELIMITER //
CREATE PROCEDURE sp_update_inventory_stock(
    IN p_inventory_id INT,
    IN p_quantity INT,
    IN p_reorder_level INT
)
BEGIN
    IF (SELECT COUNT(*) FROM inventory WHERE inventory_id = p_inventory_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Inventory ID does not exist.';
    END IF;

    IF p_quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Quantity cannot be negative.';
    END IF;

    UPDATE inventory
    SET quantity = p_quantity,
        reorder_level = COALESCE(p_reorder_level, reorder_level)
    WHERE inventory_id = p_inventory_id;

    SELECT p_inventory_id AS updated_inventory_id, 'Inventory stock updated successfully' AS status;
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 10. CUSTOMER: sp_update_customer
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_update_customer;
DELIMITER //
CREATE PROCEDURE sp_update_customer(
    IN p_cust_id INT,
    IN p_name VARCHAR(100),
    IN p_email VARCHAR(100),
    IN p_mobile_no VARCHAR(15),
    IN p_house_no VARCHAR(20),
    IN p_street VARCHAR(100),
    IN p_area VARCHAR(100),
    IN p_city VARCHAR(50),
    IN p_state VARCHAR(50),
    IN p_pincode CHAR(6)
)
BEGIN
    IF (SELECT COUNT(*) FROM customer WHERE cust_id = p_cust_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Customer ID does not exist.';
    END IF;

    UPDATE customer
    SET name = TRIM(p_name),
        email = p_email,
        mobile_no = p_mobile_no,
        house_no = p_house_no,
        street = p_street,
        area = p_area,
        city = p_city,
        state = p_state,
        pincode = p_pincode
    WHERE cust_id = p_cust_id;

    SELECT p_cust_id AS updated_cust_id, 'Customer profile updated successfully' AS status;
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 11. ORDERS: sp_update_order_status
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_update_order_status;
DELIMITER //
CREATE PROCEDURE sp_update_order_status(
    IN p_order_id INT,
    IN p_order_status VARCHAR(20),
    IN p_discount DECIMAL(10,2),
    IN p_final_amount DECIMAL(12,2)
)
BEGIN
    IF (SELECT COUNT(*) FROM orders WHERE order_id = p_order_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Order ID does not exist.';
    END IF;

    UPDATE orders
    SET order_status = p_order_status,
        discount = COALESCE(p_discount, discount),
        final_amount = COALESCE(p_final_amount, final_amount)
    WHERE order_id = p_order_id;

    SELECT p_order_id AS updated_order_id, 'Order status updated successfully' AS status;
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 12. ORDER_ITEM: sp_update_order_item
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_update_order_item;
DELIMITER //
CREATE PROCEDURE sp_update_order_item(
    IN p_order_id INT,
    IN p_variant_id INT,
    IN p_quantity INT,
    IN p_unit_price DECIMAL(10,2)
)
BEGIN
    IF (SELECT COUNT(*) FROM order_item WHERE order_id = p_order_id AND variant_id = p_variant_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Order item record not found.';
    END IF;

    IF p_quantity <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Quantity must be greater than zero.';
    END IF;

    UPDATE order_item
    SET quantity = p_quantity,
        unit_price = p_unit_price
    WHERE order_id = p_order_id AND variant_id = p_variant_id;

    SELECT 'Order item updated successfully' AS status;
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 13. PAYMENT: sp_update_payment_status
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_update_payment_status;
DELIMITER //
CREATE PROCEDURE sp_update_payment_status(
    IN p_payment_id INT,
    IN p_payment_status VARCHAR(20),
    IN p_method VARCHAR(30)
)
BEGIN
    IF (SELECT COUNT(*) FROM payment WHERE payment_id = p_payment_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Payment ID does not exist.';
    END IF;

    UPDATE payment
    SET payment_status = p_payment_status,
        method = COALESCE(p_method, method)
    WHERE payment_id = p_payment_id;

    SELECT p_payment_id AS updated_payment_id, 'Payment record updated successfully' AS status;
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 14. REVIEW: sp_update_review
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_update_review;
DELIMITER //
CREATE PROCEDURE sp_update_review(
    IN p_review_id INT,
    IN p_rating TINYINT,
    IN p_comments TEXT
)
BEGIN
    IF (SELECT COUNT(*) FROM review WHERE review_id = p_review_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Review ID does not exist.';
    END IF;

    IF p_rating < 1 OR p_rating > 5 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Rating must be between 1 and 5.';
    END IF;

    UPDATE review
    SET rating = p_rating,
        comments = p_comments,
        review_date = CURDATE()
    WHERE review_id = p_review_id;

    SELECT p_review_id AS updated_review_id, 'Review updated successfully' AS status;
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 15. PRODUCT_RETURN: sp_update_product_return_status
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_update_product_return_status;
DELIMITER //
CREATE PROCEDURE sp_update_product_return_status(
    IN p_return_id INT,
    IN p_return_status VARCHAR(20)
)
BEGIN
    IF (SELECT COUNT(*) FROM product_return WHERE return_id = p_return_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Return record ID does not exist.';
    END IF;

    UPDATE product_return
    SET return_status = p_return_status
    WHERE return_id = p_return_id;

    SELECT p_return_id AS updated_return_id, 'Return status updated successfully' AS status;
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 16. PURCHASE: sp_update_purchase
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_update_purchase;
DELIMITER //
CREATE PROCEDURE sp_update_purchase(
    IN p_purchase_id INT,
    IN p_purchase_date DATE,
    IN p_total_amount DECIMAL(12,2)
)
BEGIN
    IF (SELECT COUNT(*) FROM purchase WHERE purchase_id = p_purchase_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Purchase ID does not exist.';
    END IF;

    UPDATE purchase
    SET purchase_date = COALESCE(p_purchase_date, purchase_date),
        total_amount = COALESCE(p_total_amount, total_amount)
    WHERE purchase_id = p_purchase_id;

    SELECT p_purchase_id AS updated_purchase_id, 'Purchase order updated successfully' AS status;
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 17. PURCHASE_ITEM: sp_update_purchase_item
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_update_purchase_item;
DELIMITER //
CREATE PROCEDURE sp_update_purchase_item(
    IN p_purchase_id INT,
    IN p_variant_id INT,
    IN p_quantity INT,
    IN p_unit_cost DECIMAL(10,2)
)
BEGIN
    IF (SELECT COUNT(*) FROM purchase_item WHERE purchase_id = p_purchase_id AND variant_id = p_variant_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Purchase item record not found.';
    END IF;

    IF p_quantity <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Quantity must be greater than zero.';
    END IF;

    UPDATE purchase_item
    SET quantity = p_quantity,
        unit_cost = p_unit_cost
    WHERE purchase_id = p_purchase_id AND variant_id = p_variant_id;

    SELECT 'Purchase item updated successfully' AS status;
END //
DELIMITER ;