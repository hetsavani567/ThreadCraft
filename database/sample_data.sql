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
('Topwear',     'T-shirts, shirts, jackets, hoodies, sweaters, and top apparel'),
('Bottomwear',  'Jeans, pants, trousers, chinos, shorts, and bottom apparel'),
('Footwear',    'Sports and casual shoes'),
('Accessories', 'Caps, bags and other add-ons'),
('Winterwear',  'Warm jackets, hoodies, coats, and thermals for cold seasons'),
('Formal Wear', 'Tailored suits, blazers, dress shirts, and formal trousers'),
('Activewear',  'High-performance gym wear, compression tops, and athletic wear'),
('Ethnic Wear', 'Traditional kurtas, sherwanis, and festive attire');

-- ---------- BRAND ----------
INSERT INTO brand (brand_name, description, web_site) VALUES
('Nike',           'Global sportswear brand',                                'https://www.nike.com'),
('Adidas',         'German sportswear manufacturer',                         'https://www.adidas.com'),
('Puma',           'Athletic and casual footwear',                           'https://www.puma.com'),
('Levi''s',        'Iconic American denim and casual lifestyle brand',        'https://www.levi.com'),
('Zara',           'Global contemporary fashion and apparel brand',           'https://www.zara.com'),
('H&M',            'Swedish trend-forward fashion clothing and essentials',   'https://www.hm.com'),
('Under Armour',   'Innovative performance athletic apparel & training gear', 'https://www.underarmour.com'),
('Woodland',       'Rugged outdoor footwear, boots, and adventure apparel',   'https://www.woodlandworldwide.com'),
('Ray-Ban',        'Iconic luxury sunglasses and premium eyewear',            'https://www.ray-ban.com'),
('Tommy Hilfiger', 'Classic American designer lifestyle apparel',             'https://www.tommy.com');

-- ---------- PRODUCT ----------
INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id) VALUES
('Running T-Shirt',                      799.00, 'Breathable quick-dry running t-shirt',                                                    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80', 1, 1),
('Training Shorts',                      599.00, 'Lightweight shorts for gym and running',                                                 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=700&q=80', 2, 2),
('Running Shoes',                       3499.00, 'Cushioned road running shoes',                                                            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80', 3, 3),
('Sports Cap',                           399.00, 'Adjustable sports cap',                                                                   'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=700&q=80', 4, 1),
('Hoodie',                              1999.00, 'Fleece-lined pullover hoodie',                                                            'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=700&q=80', 1, 2),
('Classic Denim Trucker Jacket',        3499.00, 'Timeless trucker denim jacket in rugged indigo wash with reinforced stitching',          'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=700&q=80', 1, 4),
('Slim Fit Chino Trousers',             1899.00, 'Sleek tailored stretch-cotton chinos suitable for casual Fridays and smart wear',        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=700&q=80', 2, 5),
('511 Slim Fit Stretch Jeans',          2999.00, 'Modern slim-cut denim jeans with added stretch for all-day mobility',                    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=80', 2, 4),
('Oxford Cotton Casual Shirt',          2799.00, 'Pure breathable cotton button-down casual shirt with embroidered flag logo',             'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=80', 1, 10),
('Relaxed Fit Graphic Tee',              899.00, 'Soft combed organic cotton t-shirt featuring modern minimalist typography art',          'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=700&q=80', 1, 6),
('Air Max Pulse Sneakers',              4999.00, 'Revolutionary street sneaker with plush Point-Loaded Air cushioning',                    'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=700&q=80', 3, 1),
('Ultraboost Light Running Shoes',      5499.00, 'Lightweight marathon running shoes engineered with responsive Boost midsole',             'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=700&q=80', 3, 2),
('Leather Adventure Trekking Boots',    4299.00, 'Heavy-duty nubuck leather outdoor boots with deep-lugged rubber outsoles',                'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=700&q=80', 3, 8),
('Retro Suede Casual Sneakers',         2499.00, 'Iconic heritage low-top suede sneakers with signature Formstrip and rubber sole',        'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=700&q=80', 3, 3),
('Suede Penny Loafers',                 3299.00, 'Sophisticated Italian-style slip-on suede leather loafers with cushioned footbed',       'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=700&q=80', 3, 5),
('Aviator Classic Polarized Sunglasses',4599.00, 'Timeless teardrop gold-tone metal frame sunglasses with green polarized anti-glare lens', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=700&q=80', 4, 9),
('Urban Commuter Laptop Backpack',      2499.00, 'Water-resistant Storm technology backpack with padded 15-inch laptop sleeve',            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80', 4, 7),
('Full Grain Reversible Leather Belt',  1299.00, 'Handcrafted durable genuine leather belt with rotating metallic buckle',                 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=700&q=80', 4, 4),
('Sport Training Duffel Gym Bag',       1799.00, 'Medium ventilated gym duffel bag with separated shoe compartment',                       'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80', 4, 2),
('Bi-Fold Leather Cardholder Wallet',   1499.00, 'Slim RFID-blocking genuine leather bi-fold wallet with signature tricolor stripe inlay', 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=700&q=80', 4, 10),
('Feather-Light Puffer Jacket',         4499.00, 'Thermal insulated water-repellent quilted puffer jacket with detachable hood',           'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=700&q=80', 5, 5),
('Thermal Fleece Windbreaker',          3899.00, 'Wind-resistant performance coldgear fleece with half-zip mock collar',                   'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=700&q=80', 5, 7),
('Quilted Heritage Bomber Jacket',      5299.00, 'Vintage-inspired aviator flight bomber jacket with ribbed cuffs and heavy zip',          'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80', 5, 10),
('Heavyweight Wool Blend Overcoat',     4799.00, 'Knee-length tailored single-breasted wool overcoat with notched lapels',                 'https://images.unsplash.com/photo-1539533018447-63fcce667883?auto=format&fit=crop&w=700&q=80', 5, 6),
('Cable Knit Ribbed Wool Sweater',      2699.00, 'Cozy fisherman style cable-knit sweater with ribbed crew neckline and relaxed drape',     'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=700&q=80', 5, 5),
('Tailored Wool Blend Blazer',          5999.00, 'Modern slim fit two-button suit jacket blazer with peaked lapels and interior ticket pocket', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=700&q=80', 6, 5),
('Classic Solid Formal Dress Shirt',    2499.00, 'Easy-iron wrinkle-free premium cotton dress shirt with spread collar',                   'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=700&q=80', 6, 10),
('Slim Fit Pleated Formal Trousers',    2199.00, 'Structured tailored dress trousers with sharp front creases and concealed closure',       'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=700&q=80', 6, 6),
('Tuxedo Peak Lapel Evening Suit',      8999.00, 'Luxury black-tie formal 2-piece evening suit with satin shawl lapels and dress pants',   'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=700&q=80', 6, 5),
('Pro Compression Training Top',        1899.00, 'Ultra-tight second-skin fit compression shirt with HeatGear fabric',                     'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=700&q=80', 7, 7),
('Dri-FIT Athletic Track Pants',        2499.00, 'Tapered athletic sweatpants with breathable mesh panels and ankle zippers',              'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=700&q=80', 7, 1),
('Aeroready Gym Training Tank',         1199.00, 'Lightweight sleeveless gym tank top engineered with AEROREADY moisture absorbing tech',  'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=700&q=80', 7, 2),
('Seamless High-Stretch Workout Tights',2199.00, '4-way stretch non-chafing seamless athletic leggings designed for squat-proof mobility',  'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=700&q=80', 7, 7),
('Tech Fleece Full-Zip Track Jacket',   3999.00, 'Double-sided smooth fleece providing lightweight warmth with bonded zippered sleeve pocket', 'https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=700&q=80', 7, 1),
('Embroidered Silk Blend Festive Kurta',2299.00, 'Traditional festive mandarin collar silk-blend kurta with delicate thread embroidery',    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=700&q=80', 8, 5),
('Chikankari Handcrafted Cotton Kurta', 1599.00, 'Lightweight breathable cotton summer kurta featuring handcrafted Lucknowi chikankari motif work', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=80', 8, 6);

-- ---------- PRODUCT_VARIANT ----------
INSERT INTO product_variant (product_id, color_size, selling_price, is_active) VALUES
(1, 'Black-M',     799.00, TRUE),
(1, 'White-L',     829.00, TRUE),
(2, 'Blue-M',      599.00, TRUE),
(3, 'Red-9',      3499.00, TRUE),
(3, 'Black-8',    3599.00, TRUE),
(4, 'Black-Free',  399.00, TRUE),
(5, 'Grey-L',     1999.00, TRUE),
(5, 'Navy-XL',    2099.00, TRUE),
(6, 'Indigo-M',   3499.00, TRUE),
(6, 'Indigo-L',   3699.00, TRUE),
(6, 'WashedBlack-XL', 3799.00, TRUE),
(7, 'Beige-32',   1899.00, TRUE),
(7, 'Navy-34',    1899.00, TRUE),
(7, 'Olive-32',   1999.00, TRUE),
(8, 'DarkBlue-30', 2999.00, TRUE),
(8, 'DarkBlue-32', 2999.00, TRUE),
(8, 'Black-34',   3199.00, TRUE),
(9, 'White-M',    2799.00, TRUE),
(9, 'LightBlue-L', 2799.00, TRUE),
(9, 'Pink-M',     2899.00, TRUE),
(10, 'OffWhite-S', 899.00, TRUE),
(10, 'OffWhite-M', 899.00, TRUE),
(10, 'Charcoal-L', 949.00, TRUE),
(11, 'Grey/Volt-8', 4999.00, TRUE),
(11, 'Grey/Volt-9', 4999.00, TRUE),
(11, 'Black/White-10', 5199.00, TRUE),
(12, 'White-8',   5499.00, TRUE),
(12, 'White-9',   5499.00, TRUE),
(12, 'CoreBlack-9', 5499.00, TRUE),
(13, 'Camel-8',   4299.00, TRUE),
(13, 'Camel-9',   4299.00, TRUE),
(13, 'KhakiBrown-10', 4499.00, TRUE),
(14, 'ForestGreen-8', 2499.00, TRUE),
(14, 'ForestGreen-9', 2499.00, TRUE),
(14, 'Navy-9',    2599.00, TRUE),
(15, 'TanBrown-8', 3299.00, TRUE),
(15, 'TanBrown-9', 3299.00, TRUE),
(15, 'DarkBrown-10', 3499.00, TRUE),
(16, 'Gold/Green-Standard', 4599.00, TRUE),
(16, 'Gunmetal/Black-Large', 4799.00, TRUE),
(17, 'Black/Steel-OneSize', 2499.00, TRUE),
(17, 'CamoGrey-OneSize', 2699.00, TRUE),
(18, 'Black/Brown-32', 1299.00, TRUE),
(18, 'Black/Brown-34', 1299.00, TRUE),
(19, 'Black/White-39L', 1799.00, TRUE),
(19, 'NavyBlue-39L', 1899.00, TRUE),
(20, 'DarkBrown-Free', 1499.00, TRUE),
(20, 'MidnightBlack-Free', 1599.00, TRUE),
(21, 'MatteBlack-M', 4499.00, TRUE),
(21, 'MatteBlack-L', 4499.00, TRUE),
(21, 'OliveGreen-XL', 4699.00, TRUE),
(22, 'SteelGrey-M', 3899.00, TRUE),
(22, 'SteelGrey-L', 3899.00, TRUE),
(23, 'Navy-M',    5299.00, TRUE),
(23, 'Navy-L',    5299.00, TRUE),
(24, 'Camel-M',   4799.00, TRUE),
(24, 'Camel-L',   4799.00, TRUE),
(25, 'Cream-M',   2699.00, TRUE),
(25, 'Cream-L',   2699.00, TRUE),
(26, 'Charcoal-38R', 5999.00, TRUE),
(26, 'Charcoal-40R', 5999.00, TRUE),
(26, 'MidnightNavy-42R', 6299.00, TRUE),
(27, 'CrispWhite-39', 2499.00, TRUE),
(27, 'CrispWhite-40', 2499.00, TRUE),
(28, 'SlateGrey-32', 2199.00, TRUE),
(28, 'SlateGrey-34', 2199.00, TRUE),
(29, 'JetBlack-38', 8999.00, TRUE),
(29, 'JetBlack-40', 8999.00, TRUE),
(30, 'Black-M',   1899.00, TRUE),
(30, 'Black-L',   1899.00, TRUE),
(31, 'Black/White-M', 2499.00, TRUE),
(31, 'Black/White-L', 2499.00, TRUE),
(32, 'SolarRed-M', 1199.00, TRUE),
(32, 'CoreBlack-L', 1249.00, TRUE),
(33, 'HeatherCharcoal-S', 2199.00, TRUE),
(33, 'HeatherCharcoal-M', 2199.00, TRUE),
(34, 'HeatherGrey-M', 3999.00, TRUE),
(34, 'Black-XL',  4199.00, TRUE),
(35, 'Maroon-M',  2299.00, TRUE),
(35, 'Maroon-L',  2299.00, TRUE),
(35, 'RoyalGold-L', 2499.00, TRUE),
(36, 'PureWhite-M', 1599.00, TRUE),
(36, 'PureWhite-L', 1599.00, TRUE),
(36, 'SkyBlue-M', 1699.00, TRUE);

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
(1, 1, 48, 10), (2, 1, 30, 10), (6, 1,  5, 10), (4, 1, 14,  5),
(3, 2, 37, 10), (4, 2, 20,  5), (6, 2, 18, 10), (1, 2, 15, 10),
(7, 3, 24,  5), (8, 3, 14,  5),
(9, 1, 25,  5), (10, 1, 20,  5), (11, 2, 15,  5), (12, 1, 30,  5),
(13, 2, 22,  5), (14, 3, 18,  5), (15, 1, 40,  8), (16, 2, 35,  8),
(17, 3, 20,  5), (18, 1, 25,  5), (19, 2, 20,  5), (20, 3, 15,  5),
(21, 1, 18,  5), (22, 2, 16,  5), (23, 3, 12,  5), (24, 1, 22,  5),
(25, 2, 20,  5), (26, 3, 14,  5), (27, 1, 15,  5), (28, 2, 18,  5),
(29, 3, 12,  5), (30, 1, 28,  5), (31, 2, 24,  5), (32, 3, 20,  5),
(33, 1, 22,  5), (34, 2, 18,  5), (35, 1, 25,  5), (36, 2, 20,  5);

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