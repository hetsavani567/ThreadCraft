-- =====================================================================
-- DATA INSERTION SCRIPT  (run AFTER retail_dbms_schema_v2.sql)
-- Parents are inserted before children so foreign keys are satisfied.
-- All amounts are consistent:
--   order final_amount = SUM(quantity * unit_price) - discount
--   payments of an order add up to its final_amount
--   purchase total_amount = SUM(quantity * unit_cost)
-- =====================================================================
USE retail_db;

-- ---------- CATEGORY ----------
INSERT INTO category (category_type, description) VALUES
('Clothing',    'Apparel for training and daily wear'),
('Footwear',    'Sports and casual shoes'),
('Accessories', 'Caps, bags and other add-ons');

-- ---------- BRAND ----------
INSERT INTO brand (brand_name, description, web_site) VALUES
('Nike',   'Global sportswear brand',        'https://www.nike.com'),
('Adidas', 'German sportswear manufacturer', 'https://www.adidas.com'),
('Puma',   'Athletic and casual footwear',   'https://www.puma.com');

-- ---------- PRODUCT ----------
INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id) VALUES
('Running T-Shirt',  799.00, 'Breathable quick-dry running t-shirt',   'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80', 1, 1),
('Training Shorts',  599.00, 'Lightweight shorts for gym and running', 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=700&q=80', 1, 2),
('Running Shoes',   3499.00, 'Cushioned road running shoes',           'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80', 2, 3),
('Sports Cap',       399.00, 'Adjustable sports cap',                  'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=700&q=80', 3, 1),
('Hoodie',          1999.00, 'Fleece-lined pullover hoodie',           'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=700&q=80', 1, 2);

-- ---------- PRODUCT_VARIANT ----------
INSERT INTO product_variant (product_id, color_size, selling_price, is_active) VALUES
(1, 'Black-M',     799.00, TRUE),   -- variant_id 1
(1, 'White-L',     829.00, TRUE),   -- 2
(2, 'Blue-M',      599.00, TRUE),   -- 3
(3, 'Red-9',      3499.00, TRUE),   -- 4
(3, 'Black-8',    3599.00, TRUE),   -- 5
(4, 'Black-Free',  399.00, TRUE),   -- 6
(5, 'Grey-L',     1999.00, TRUE),   -- 7
(5, 'Navy-XL',    2099.00, TRUE);   -- 8

-- ---------- BRANCH ----------
INSERT INTO branch (branch_name, phone, is_active, house_no, street, area, city, state, pincode) VALUES
('Surat Central',   '0261-2400001', TRUE, '1',  'Ring Road',  'Adajan',       'Surat',     'Gujarat',     '395009'),
('Ahmedabad West',  '079-26500002', TRUE, '15', 'SG Highway', 'Bodakdev',     'Ahmedabad', 'Gujarat',     '380054'),
('Mumbai Andheri',  '022-28000003', TRUE, '8',  'Link Road',  'Andheri West', 'Mumbai',    'Maharashtra', '400053');

-- ---------- SUPPLIER ----------
INSERT INTO supplier (supplier_name, gst, mobile_no, email, house_no, street, area, city, state, pincode) VALUES
('Sportwear Traders',     '24AAACS1234A1Z5', '9898000011', 'sales@sportwear.example.com',    '21', 'Textile Market', 'Ring Road', 'Surat',     'Gujarat',     '395002'),
('Urban Apparel Co',      '24AABCU5678B1Z2', '9898000022', 'info@urbanapparel.example.com',  '5',  'CG Road',        'Navrangpura','Ahmedabad', 'Gujarat',     '380009'),
('Fit Gear Distributors', '27AAFCF9012C1Z8', '9898000033', 'orders@fitgear.example.com',     '40', 'Dadar Market',   'Dadar',     'Mumbai',    'Maharashtra', '400014');

-- ---------- BRANCH_SUPPLIER (works_with, M:N) ----------
INSERT INTO branch_supplier (branch_id, supplier_id) VALUES
(1, 1), (1, 2), (2, 2), (2, 3), (3, 3), (3, 1);

-- ---------- EMPLOYEE ----------
INSERT INTO employee (emp_name, mobile, emp_email, emp_role, salary, join_date, emp_status, branch_id) VALUES
('Suresh Joshi',    '9800000001', 'suresh.joshi@retail.example.com',  'Branch Manager',  45000.00, '2024-01-10', 'Active', 1),
('Anita Desai',     '9800000002', 'anita.desai@retail.example.com',   'Cashier',         22000.00, '2024-06-15', 'Active', 1),
('Vikram Rao',      '9800000003', 'vikram.rao@retail.example.com',    'Branch Manager',  46000.00, '2023-11-01', 'Active', 2),
('Pooja Nair',      '9800000004', 'pooja.nair@retail.example.com',    'Sales Associate', 24000.00, '2025-02-20', 'Active', 2),
('Manish Kulkarni', '9800000005', 'manish.k@retail.example.com',      'Branch Manager',  47000.00, '2023-08-05', 'Active', 3);

-- ---------- INVENTORY (UNIQUE variant + branch) ----------
INSERT INTO inventory (variant_id, branch_id, quantity, reorder_level) VALUES
(1, 1, 48, 10),
(2, 1, 30, 10),
(6, 1,  5, 10),   -- below reorder level: shows up in the low-stock query
(4, 1, 14,  5),
(3, 2, 37, 10),
(4, 2, 20,  5),
(6, 2, 18, 10),
(1, 2, 15, 10),
(7, 3, 24,  5),
(8, 3, 14,  5);

-- ---------- CUSTOMER ----------
INSERT INTO customer (name, email, mobile_no, house_no, street, area, city, state, pincode) VALUES
('Rahul Mehta', 'rahul.mehta@example.com', '9876500001', '12',  'Ring Road',    'Adajan',      'Surat',     'Gujarat',     '395009'),
('Priya Shah',  'priya.shah@example.com',  '9876500002', '45',  'Station Road', 'Vesu',        'Surat',     'Gujarat',     '395007'),
('Amit Patel',  'amit.patel@example.com',  '9876500003', '7',   'MG Road',      'Navrangpura', 'Ahmedabad', 'Gujarat',     '380009'),
('Neha Verma',  'neha.verma@example.com',  '9876500004', '101', 'Park Street',  'Andheri',     'Mumbai',    'Maharashtra', '400053'),
('Karan Singh', 'karan.singh@example.com', '9876500005', '22',  'Civil Lines',  'Sector 5',    'Jaipur',    'Rajasthan',   '302006');

-- ---------- ORDERS ----------
INSERT INTO orders (cust_id, branch_id, order_date, order_status, discount, final_amount) VALUES
(1, 1, '2026-09-01', 'Completed',   0.00, 1997.00),   -- order_id 1
(2, 1, '2026-09-05', 'Completed', 100.00, 3399.00),   -- 2
(3, 2, '2026-09-10', 'Completed',   0.00, 2595.00),   -- 3
(4, 3, '2026-09-15', 'Placed',    200.00, 3898.00),   -- 4
(1, 2, '2026-09-20', 'Cancelled',   0.00, 3499.00);   -- 5

-- ---------- ORDER_ITEM ----------
INSERT INTO order_item (order_id, variant_id, quantity, unit_price) VALUES
(1, 1, 2,  799.00),
(1, 6, 1,  399.00),
(2, 4, 1, 3499.00),
(3, 3, 3,  599.00),
(3, 6, 2,  399.00),
(4, 7, 1, 1999.00),
(4, 8, 1, 2099.00),
(5, 4, 1, 3499.00);

-- ---------- PAYMENT (Order 1:N Payment -> split payments allowed) ----------
INSERT INTO payment (order_id, amount, method, payment_status, payment_datetime) VALUES
(1, 1997.00, 'UPI',  'Paid',    '2026-09-01 11:05:00'),   -- payment_id 1
(2, 2000.00, 'Card', 'Paid',    '2026-09-05 15:20:00'),   -- 2
(2, 1399.00, 'Cash', 'Paid',    '2026-09-05 15:22:00'),   -- 3
(3, 2595.00, 'Cash', 'Paid',    '2026-09-10 12:40:00'),   -- 4
(4, 1000.00, 'UPI',  'Paid',    '2026-09-15 18:00:00'),   -- 5
(4, 2898.00, 'UPI',  'Pending', '2026-09-22 10:00:00');   -- 6

-- ---------- REVIEW ----------
INSERT INTO review (product_id, cust_id, review_date, rating, comments) VALUES
(1, 1, '2026-09-10', 5, 'Great fit and fabric'),
(3, 2, '2026-09-12', 5, 'Very comfortable shoes'),
(4, 1, '2026-09-11', 3, 'Average quality cap'),
(2, 3, '2026-09-18', 4, 'Good quality shorts');

-- ---------- PRODUCT_RETURN (references an existing order_item) ----------
INSERT INTO product_return (order_id, variant_id, quantity, reason, return_datetime, return_status, refund_amount) VALUES
(1, 1, 1, 'Size too large',    '2026-09-05 16:10:00', 'Completed', 799.00),
(3, 6, 1, 'Not as expected',   '2026-09-14 11:30:00', 'Approved',  399.00);

-- ---------- PURCHASE ----------
INSERT INTO purchase (supplier_id, emp_id, branch_id, purchase_date, total_amount) VALUES
(1, 1, 1, '2026-08-20', 40600.00),   -- purch_id 1
(2, 3, 2, '2026-08-25', 62000.00),   -- 2
(3, 5, 3, '2026-09-01', 57500.00);   -- 3

-- ---------- PURCHASE_ITEM ----------
INSERT INTO purchase_item (purchase_id, variant_id, quantity, unit_cost) VALUES
(1, 1, 50,  500.00),
(1, 2, 30,  520.00),
(2, 3, 40,  350.00),
(2, 4, 20, 2400.00),
(3, 7, 25, 1400.00),
(3, 8, 15, 1500.00);

-- ---------- Quick check of row counts ----------
SELECT 'category' AS tbl, COUNT(*) AS rows_inserted FROM category
UNION ALL SELECT 'brand', COUNT(*) FROM brand
UNION ALL SELECT 'product', COUNT(*) FROM product
UNION ALL SELECT 'product_variant', COUNT(*) FROM product_variant
UNION ALL SELECT 'branch', COUNT(*) FROM branch
UNION ALL SELECT 'supplier', COUNT(*) FROM supplier
UNION ALL SELECT 'branch_supplier', COUNT(*) FROM branch_supplier
UNION ALL SELECT 'employee', COUNT(*) FROM employee
UNION ALL SELECT 'inventory', COUNT(*) FROM inventory
UNION ALL SELECT 'customer', COUNT(*) FROM customer
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'order_item', COUNT(*) FROM order_item
UNION ALL SELECT 'payment', COUNT(*) FROM payment
UNION ALL SELECT 'review', COUNT(*) FROM review
UNION ALL SELECT 'product_return', COUNT(*) FROM product_return
UNION ALL SELECT 'purchase', COUNT(*) FROM purchase
UNION ALL SELECT 'purchase_item', COUNT(*) FROM purchase_item;


update product set Image_URL = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80' where product_id = 1;
update product set Image_URL = 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=700&q=80' where product_id = 2;
update product set Image_URL = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80' where product_id = 3;
update product set Image_URL = 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=700&q=80' where product_id = 4;
update product set Image_URL = 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=700&q=80' where product_id = 5;