USE retail_db;

-- =====================================================================
-- COMPLETE DELETE STORED PROCEDURES FOR ALL THREADCRAFT TABLES (17 Tables)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. CATEGORY: sp_delete_category
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_delete_category;
DELIMITER //
CREATE PROCEDURE sp_delete_category(
    IN p_category_id INT
)
BEGIN
    IF (SELECT COUNT(*) FROM category WHERE category_id = p_category_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Category ID does not exist.';
    END IF;

    IF (SELECT COUNT(*) FROM product WHERE category_id = p_category_id) > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Integrity Error: Cannot delete category. Products are linked to this category.';
    END IF;

    DELETE FROM category WHERE category_id = p_category_id;

    SELECT p_category_id AS deleted_category_id, 'Category deleted successfully' AS status;
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 2. BRAND: sp_delete_brand
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_delete_brand;
DELIMITER //
CREATE PROCEDURE sp_delete_brand(
    IN p_brand_id INT
)
BEGIN
    IF (SELECT COUNT(*) FROM brand WHERE brand_id = p_brand_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Brand ID does not exist.';
    END IF;

    IF (SELECT COUNT(*) FROM product WHERE brand_id = p_brand_id) > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Integrity Error: Cannot delete brand. Products are linked to this brand.';
    END IF;

    DELETE FROM brand WHERE brand_id = p_brand_id;

    SELECT p_brand_id AS deleted_brand_id, 'Brand deleted successfully' AS status;
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 3. PRODUCT: sp_delete_product
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_delete_product;
DELIMITER //
CREATE PROCEDURE sp_delete_product(
    IN p_product_id INT
)
BEGIN
    IF (SELECT COUNT(*) FROM product WHERE product_id = p_product_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Cannot delete. Product ID does not exist.';
    END IF;

    DELETE FROM review WHERE product_id = p_product_id;
    DELETE FROM product WHERE product_id = p_product_id;

    SELECT p_product_id AS deleted_product_id, 'Product and associated reviews deleted successfully' AS status;
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 4. PRODUCT_VARIANT: sp_delete_product_variant
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_delete_product_variant;
DELIMITER //
CREATE PROCEDURE sp_delete_product_variant(
    IN p_variant_id INT
)
BEGIN
    IF (SELECT COUNT(*) FROM product_variant WHERE variant_id = p_variant_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Variant ID does not exist.';
    END IF;

    DELETE FROM inventory WHERE variant_id = p_variant_id;
    DELETE FROM product_variant WHERE variant_id = p_variant_id;

    SELECT p_variant_id AS deleted_variant_id, 'Variant and inventory records deleted successfully' AS status;
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 5. BRANCH: sp_delete_branch
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_delete_branch;
DELIMITER //
CREATE PROCEDURE sp_delete_branch(
    IN p_branch_id INT
)
BEGIN
    IF (SELECT COUNT(*) FROM branch WHERE branch_id = p_branch_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Branch ID does not exist.';
    END IF;

    -- Soft delete: deactivates branch so orders and history remain intact
    UPDATE branch SET is_active = 0 WHERE branch_id = p_branch_id;

    SELECT p_branch_id AS deactivated_branch_id, 'Branch deactivated successfully' AS status;
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 6. SUPPLIER: sp_delete_supplier
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_delete_supplier;
DELIMITER //
CREATE PROCEDURE sp_delete_supplier(
    IN p_supplier_id INT
)
BEGIN
    IF (SELECT COUNT(*) FROM supplier WHERE supplier_id = p_supplier_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Supplier ID does not exist.';
    END IF;

    DELETE FROM branch_supplier WHERE supplier_id = p_supplier_id;
    DELETE FROM supplier WHERE supplier_id = p_supplier_id;

    SELECT p_supplier_id AS deleted_supplier_id, 'Supplier deleted successfully' AS status;
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 7. BRANCH_SUPPLIER: sp_delete_branch_supplier
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_delete_branch_supplier;
DELIMITER //
CREATE PROCEDURE sp_delete_branch_supplier(
    IN p_branch_id INT,
    IN p_supplier_id INT
)
BEGIN
    IF (SELECT COUNT(*) FROM branch_supplier WHERE branch_id = p_branch_id AND supplier_id = p_supplier_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Branch-supplier mapping does not exist.';
    END IF;

    DELETE FROM branch_supplier WHERE branch_id = p_branch_id AND supplier_id = p_supplier_id;

    SELECT 'Branch-Supplier mapping removed successfully' AS status;
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 8. EMPLOYEE: sp_delete_employee
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_delete_employee;
DELIMITER //
CREATE PROCEDURE sp_delete_employee(
    IN p_emp_id INT
)
BEGIN
    IF (SELECT COUNT(*) FROM employee WHERE emp_id = p_emp_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Employee ID does not exist.';
    END IF;

    -- Soft delete: set status to 'Terminated' to preserve purchase/sales logs
    UPDATE employee SET emp_status = 'Terminated' WHERE emp_id = p_emp_id;

    SELECT p_emp_id AS emp_id, 'Employee status marked as Terminated' AS status;
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 9. INVENTORY: sp_delete_inventory
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_delete_inventory;
DELIMITER //
CREATE PROCEDURE sp_delete_inventory(
    IN p_inventory_id INT
)
BEGIN
    IF (SELECT COUNT(*) FROM inventory WHERE inventory_id = p_inventory_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Inventory record does not exist.';
    END IF;

    DELETE FROM inventory WHERE inventory_id = p_inventory_id;

    SELECT p_inventory_id AS deleted_inventory_id, 'Inventory record removed successfully' AS status;
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 10. CUSTOMER: sp_delete_customer
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_delete_customer;
DELIMITER //
CREATE PROCEDURE sp_delete_customer(
    IN p_cust_id INT
)
BEGIN
    IF (SELECT COUNT(*) FROM customer WHERE cust_id = p_cust_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Customer ID does not exist.';
    END IF;

    DELETE FROM review WHERE cust_id = p_cust_id;
    DELETE FROM customer WHERE cust_id = p_cust_id;

    SELECT p_cust_id AS deleted_cust_id, 'Customer account deleted successfully' AS status;
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 11. ORDERS: sp_delete_order
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_delete_order;
DELIMITER //
CREATE PROCEDURE sp_delete_order(
    IN p_order_id INT
)
BEGIN
    IF (SELECT COUNT(*) FROM orders WHERE order_id = p_order_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Order ID does not exist.';
    END IF;

    DELETE FROM product_return WHERE order_id = p_order_id;
    DELETE FROM payment WHERE order_id = p_order_id;
    DELETE FROM order_item WHERE order_id = p_order_id;
    DELETE FROM orders WHERE order_id = p_order_id;

    SELECT p_order_id AS deleted_order_id, 'Order and associated line items deleted successfully' AS status;
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 12. ORDER_ITEM: sp_delete_order_item
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_delete_order_item;
DELIMITER //
CREATE PROCEDURE sp_delete_order_item(
    IN p_order_id INT,
    IN p_variant_id INT
)
BEGIN
    IF (SELECT COUNT(*) FROM order_item WHERE order_id = p_order_id AND variant_id = p_variant_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Order item not found.';
    END IF;

    DELETE FROM order_item WHERE order_id = p_order_id AND variant_id = p_variant_id;

    SELECT 'Order item removed successfully' AS status;
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 13. PAYMENT: sp_delete_payment
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_delete_payment;
DELIMITER //
CREATE PROCEDURE sp_delete_payment(
    IN p_payment_id INT
)
BEGIN
    IF (SELECT COUNT(*) FROM payment WHERE payment_id = p_payment_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Payment record does not exist.';
    END IF;

    DELETE FROM payment WHERE payment_id = p_payment_id;

    SELECT p_payment_id AS deleted_payment_id, 'Payment record deleted successfully' AS status;
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 14. REVIEW: sp_delete_review
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_delete_review;
DELIMITER //
CREATE PROCEDURE sp_delete_review(
    IN p_review_id INT
)
BEGIN
    IF (SELECT COUNT(*) FROM review WHERE review_id = p_review_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Review ID does not exist.';
    END IF;

    DELETE FROM review WHERE review_id = p_review_id;

    SELECT p_review_id AS deleted_review_id, 'Review deleted successfully' AS status;
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 15. PRODUCT_RETURN: sp_delete_product_return
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_delete_product_return;
DELIMITER //
CREATE PROCEDURE sp_delete_product_return(
    IN p_return_id INT
)
BEGIN
    IF (SELECT COUNT(*) FROM product_return WHERE return_id = p_return_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Return record does not exist.';
    END IF;

    DELETE FROM product_return WHERE return_id = p_return_id;

    SELECT p_return_id AS deleted_return_id, 'Product return record deleted successfully' AS status;
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 16. PURCHASE: sp_delete_purchase
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_delete_purchase;
DELIMITER //
CREATE PROCEDURE sp_delete_purchase(
    IN p_purchase_id INT
)
BEGIN
    IF (SELECT COUNT(*) FROM purchase WHERE purchase_id = p_purchase_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Purchase ID does not exist.';
    END IF;

    DELETE FROM purchase_item WHERE purchase_id = p_purchase_id;
    DELETE FROM purchase WHERE purchase_id = p_purchase_id;

    SELECT p_purchase_id AS deleted_purchase_id, 'Purchase order and line items deleted successfully' AS status;
END //
DELIMITER ;


-- ---------------------------------------------------------------------
-- 17. PURCHASE_ITEM: sp_delete_purchase_item
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_delete_purchase_item;
DELIMITER //
CREATE PROCEDURE sp_delete_purchase_item(
    IN p_purchase_id INT,
    IN p_variant_id INT
)
BEGIN
    IF (SELECT COUNT(*) FROM purchase_item WHERE purchase_id = p_purchase_id AND variant_id = p_variant_id) = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Purchase line item not found.';
    END IF;

    DELETE FROM purchase_item WHERE purchase_id = p_purchase_id AND variant_id = p_variant_id;

    SELECT 'Purchase item removed successfully' AS status;
END //
DELIMITER ;