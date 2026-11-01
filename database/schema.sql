-- =====================================================================
-- Retail DBMS Project - MySQL schema (MySQL 8.0.16+ for CHECK support)
-- Built from the team ER diagram. Columns = attributes drawn in the ER
-- diagram. Foreign-key columns are the only additions needed to
-- implement the relationships. Derived attributes (dashed ovals) are
-- NOT stored; they are provided as views at the end.
-- Tables are created parents first.
-- =====================================================================

DROP DATABASE IF EXISTS retail_db;
CREATE DATABASE retail_db;
USE retail_db;

-- ---------------------------------------------------------------------
-- CATEGORY
-- ---------------------------------------------------------------------
CREATE TABLE category (
    category_id    INT AUTO_INCREMENT PRIMARY KEY,
    category_type  VARCHAR(100) NOT NULL,
    description    VARCHAR(255)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- BRAND
-- ---------------------------------------------------------------------
CREATE TABLE brand (
    brand_id     INT AUTO_INCREMENT PRIMARY KEY,
    brand_name   VARCHAR(100) NOT NULL,
    description  VARCHAR(255),
    web_site     VARCHAR(255)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- PRODUCT
-- Category 1:N Product (Has), Brand 1:N Product (Belong_to)
-- ---------------------------------------------------------------------
CREATE TABLE product (
    product_id           INT AUTO_INCREMENT PRIMARY KEY,
    product_name         VARCHAR(150) NOT NULL,
    product_description  VARCHAR(500),
	Image_URL text default null,
    category_id          INT NOT NULL,   -- FK for "Has"
    brand_id             INT NOT NULL,   -- FK for "Belong_to"
    CONSTRAINT fk_product_category FOREIGN KEY (category_id)
        REFERENCES category(category_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_product_brand FOREIGN KEY (brand_id)
        REFERENCES brand(brand_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- PRODUCT_VARIANT
-- Product 1:N Product_Variant (Has)
-- ---------------------------------------------------------------------
CREATE TABLE product_variant (
    variant_id     INT AUTO_INCREMENT PRIMARY KEY,
    product_id     INT NOT NULL,
    color_size     VARCHAR(50) NOT NULL,
    selling_price  DECIMAL(10,2) NOT NULL CHECK (selling_price >= 0),
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    discount_percent INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_variant_product FOREIGN KEY (product_id)
        REFERENCES product(product_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- BRANCH  (composite attribute Address flattened)
-- Total_Expense is derived -> see view branch_expense
-- ---------------------------------------------------------------------
CREATE TABLE branch (
    branch_id    INT AUTO_INCREMENT PRIMARY KEY,
    branch_name  VARCHAR(100) NOT NULL,
    phone        VARCHAR(15) NOT NULL,
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    house_no     VARCHAR(20),
    street       VARCHAR(100),
    area         VARCHAR(100),
    city         VARCHAR(50),
    state        VARCHAR(50),
    pincode      CHAR(6)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- SUPPLIER  (composite attribute Address flattened)
-- ---------------------------------------------------------------------
CREATE TABLE supplier (
    supplier_id    INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name  VARCHAR(100) NOT NULL,
    gst            VARCHAR(15) UNIQUE,
    mobile_no      VARCHAR(15),
    email          VARCHAR(100) UNIQUE,
    house_no       VARCHAR(20),
    street         VARCHAR(100),
    area           VARCHAR(100),
    city           VARCHAR(50),
    state          VARCHAR(50),
    pincode        CHAR(6)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- BRANCH <-> SUPPLIER  (works_with, M:N -> junction table)
-- ---------------------------------------------------------------------
CREATE TABLE branch_supplier (
    branch_id    INT NOT NULL,
    supplier_id  INT NOT NULL,
    PRIMARY KEY (branch_id, supplier_id),
    CONSTRAINT fk_bs_branch FOREIGN KEY (branch_id)
        REFERENCES branch(branch_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_bs_supplier FOREIGN KEY (supplier_id)
        REFERENCES supplier(supplier_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- EMPLOYEE
-- Branch 1:N Employee (Available_in)
-- ---------------------------------------------------------------------
CREATE TABLE employee (
    emp_id      INT AUTO_INCREMENT PRIMARY KEY,
    emp_name    VARCHAR(100) NOT NULL,
    mobile      VARCHAR(15),
    emp_email   VARCHAR(100) UNIQUE,
    emp_role    VARCHAR(50),
    salary      DECIMAL(10,2) CHECK (salary >= 0),
    join_date   DATE,
    emp_status  VARCHAR(20),
    branch_id   INT NOT NULL,
    CONSTRAINT fk_emp_branch FOREIGN KEY (branch_id)
        REFERENCES branch(branch_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- INVENTORY
-- Product_Variant 1:N Inventory, Branch 1:N Inventory (both Available_in)
-- ---------------------------------------------------------------------
CREATE TABLE inventory (
    inventory_id   INT AUTO_INCREMENT PRIMARY KEY,
    variant_id     INT NOT NULL,
    branch_id      INT NOT NULL,
    quantity       INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    reorder_level  INT NOT NULL DEFAULT 0 CHECK (reorder_level >= 0),
    last_updated   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                   ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_inventory_variant_branch UNIQUE (variant_id, branch_id),
    CONSTRAINT fk_inv_variant FOREIGN KEY (variant_id)
        REFERENCES product_variant(variant_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_inv_branch FOREIGN KEY (branch_id)
        REFERENCES branch(branch_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- CUSTOMER  (composite attribute Address flattened)
-- ---------------------------------------------------------------------
CREATE TABLE customer (
    cust_id    INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(100) UNIQUE,
    mobile_no  VARCHAR(15),
    house_no   VARCHAR(20),
    street     VARCHAR(100),
    area       VARCHAR(100),
    city       VARCHAR(50),
    state      VARCHAR(50),
    pincode    CHAR(6)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- ORDER  (ORDER is a reserved word in MySQL -> table named orders)
-- Customer 1:N Order (places), Branch 1:N Order (from)
-- Total_Amount is derived -> see view order_total
-- ---------------------------------------------------------------------
CREATE TABLE orders (
    order_id      INT AUTO_INCREMENT PRIMARY KEY,
    cust_id       INT NOT NULL,
    branch_id     INT NOT NULL,
    order_date    DATE NOT NULL,
    order_status  VARCHAR(20) NOT NULL,
    discount      DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
    final_amount  DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (final_amount >= 0),
    CONSTRAINT fk_order_customer FOREIGN KEY (cust_id)
        REFERENCES customer(cust_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_order_branch FOREIGN KEY (branch_id)
        REFERENCES branch(branch_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- ORDER_ITEM  (PK = order_id + variant_id)
-- Order 1:N Order_Item (purchase), Product_Variant 1:N Order_Item
-- Net_Price is derived -> see view order_item_net
-- ---------------------------------------------------------------------
CREATE TABLE order_item (
    order_id    INT NOT NULL,
    variant_id  INT NOT NULL,
    quantity    INT NOT NULL CHECK (quantity > 0),
    unit_price  DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    PRIMARY KEY (order_id, variant_id),
    CONSTRAINT fk_oi_order FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_oi_variant FOREIGN KEY (variant_id)
        REFERENCES product_variant(variant_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- PAYMENT
-- Order 1:N Payment (pay)
-- ---------------------------------------------------------------------
CREATE TABLE payment (
    payment_id        INT AUTO_INCREMENT PRIMARY KEY,
    order_id          INT NOT NULL,
    amount            DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
    method            VARCHAR(30) NOT NULL,
    payment_status    VARCHAR(20) NOT NULL,
    payment_datetime  DATETIME NOT NULL,
    CONSTRAINT fk_pay_order FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- REVIEW
-- Customer 1:N Review (gives); Review carries Product_Id as drawn
-- ("Date" attribute is named review_date to avoid a keyword column name)
-- ---------------------------------------------------------------------
CREATE TABLE review (
    review_id    INT AUTO_INCREMENT PRIMARY KEY,
    product_id   INT NOT NULL,
    cust_id      INT NOT NULL,
    review_date  DATE NOT NULL,
    rating       TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comments     TEXT,
    CONSTRAINT fk_review_product FOREIGN KEY (product_id)
        REFERENCES product(product_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_review_customer FOREIGN KEY (cust_id)
        REFERENCES customer(cust_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- RETURN  (RETURN is a reserved word -> table named product_return)
-- Order_Item 1:N Return (for) -> composite FK (order_id, variant_id)
-- ---------------------------------------------------------------------
CREATE TABLE product_return (
    return_id        INT AUTO_INCREMENT PRIMARY KEY,
    order_id         INT NOT NULL,
    variant_id       INT NOT NULL,
    quantity         INT NOT NULL CHECK (quantity > 0),
    reason           VARCHAR(255),
    return_datetime  DATETIME NOT NULL,
    return_status    VARCHAR(20) NOT NULL,
    refund_amount    DECIMAL(10,2) CHECK (refund_amount >= 0),
    CONSTRAINT fk_return_item FOREIGN KEY (order_id, variant_id)
        REFERENCES order_item(order_id, variant_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- PURCHASE
-- Supplier 1:N Purchase (Supplies), Employee 1:N Purchase (Handles),
-- Branch 1:N Purchase (Supplies)
-- ---------------------------------------------------------------------
CREATE TABLE purchase (
    purch_id       INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id    INT NOT NULL,
    emp_id         INT NOT NULL,
    branch_id      INT NOT NULL,
    purchase_date  DATE NOT NULL,
    total_amount   DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    CONSTRAINT fk_purchase_supplier FOREIGN KEY (supplier_id)
        REFERENCES supplier(supplier_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_purchase_emp FOREIGN KEY (emp_id)
        REFERENCES employee(emp_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_purchase_branch FOREIGN KEY (branch_id)
        REFERENCES branch(branch_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- PURCHASE_ITEM  (PK = purchase_id + variant_id)
-- Purchase 1:N Purchase_Item (Includes); variant_id as drawn in ER
-- ---------------------------------------------------------------------
CREATE TABLE purchase_item (
    purchase_id  INT NOT NULL,
    variant_id   INT NOT NULL,
    quantity     INT NOT NULL CHECK (quantity > 0),
    unit_cost    DECIMAL(10,2) NOT NULL CHECK (unit_cost >= 0),
    PRIMARY KEY (purchase_id, variant_id),
    CONSTRAINT fk_pi_purchase FOREIGN KEY (purchase_id)
        REFERENCES purchase(purch_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_pi_variant FOREIGN KEY (variant_id)
        REFERENCES product_variant(variant_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- Views for the DERIVED attributes (dashed ovals in the ER diagram)
-- =====================================================================

CREATE VIEW order_item_net AS
SELECT order_id, variant_id, quantity * unit_price AS net_price
FROM order_item;

CREATE VIEW order_total AS
SELECT order_id, SUM(quantity * unit_price) AS total_amount
FROM order_item
GROUP BY order_id;

CREATE VIEW branch_expense AS
SELECT branch_id, SUM(total_amount) AS total_expense
FROM purchase
GROUP BY branch_id;
