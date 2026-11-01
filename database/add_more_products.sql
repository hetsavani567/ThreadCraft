-- =====================================================================
-- THREADCRAFT RETAIL DBMS - EXPANDED CATALOG INSERT SCRIPT
-- =====================================================================
-- Purpose: Adds new Categories, Brands, Products, Variants, Inventory,
--          and Reviews to expand customer choices in ThreadCraft.
-- Compatibility: Directly runnable in MySQL Workbench or MySQL CLI.
-- Safe & Idempotent: Uses WHERE NOT EXISTS and FROM DUAL so it can be
--                    safely executed multiple times without duplicates.
-- =====================================================================

USE retail_db;

-- =====================================================================
-- 1. INSERT NEW CATEGORIES
-- =====================================================================
INSERT INTO category (category_type, description)
SELECT 'Topwear', 'T-shirts, shirts, jackets, hoodies, sweaters, and top apparel'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM category WHERE category_type = 'Topwear');

INSERT INTO category (category_type, description)
SELECT 'Bottomwear', 'Jeans, pants, trousers, chinos, shorts, and bottom apparel'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM category WHERE category_type = 'Bottomwear');

INSERT INTO category (category_type, description)
SELECT 'Winterwear', 'Warm jackets, hoodies, coats, and thermals for cold seasons'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM category WHERE category_type = 'Winterwear');

INSERT INTO category (category_type, description)
SELECT 'Formal Wear', 'Tailored suits, blazers, dress shirts, and formal trousers'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM category WHERE category_type = 'Formal Wear');

INSERT INTO category (category_type, description)
SELECT 'Activewear', 'High-performance gym wear, compression tops, and athletic wear'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM category WHERE category_type = 'Activewear');

INSERT INTO category (category_type, description)
SELECT 'Ethnic Wear', 'Traditional kurtas, sherwanis, and festive attire'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM category WHERE category_type = 'Ethnic Wear');


-- =====================================================================
-- 2. INSERT NEW BRANDS
-- =====================================================================
INSERT INTO brand (brand_name, description, web_site)
SELECT 'Levi''s', 'Iconic American denim and casual lifestyle brand', 'https://www.levi.com'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM brand WHERE brand_name = 'Levi''s');

INSERT INTO brand (brand_name, description, web_site)
SELECT 'Zara', 'Global contemporary fashion and apparel brand', 'https://www.zara.com'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM brand WHERE brand_name = 'Zara');

INSERT INTO brand (brand_name, description, web_site)
SELECT 'H&M', 'Swedish trend-forward fashion clothing and essentials', 'https://www.hm.com'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM brand WHERE brand_name = 'H&M');

INSERT INTO brand (brand_name, description, web_site)
SELECT 'Under Armour', 'Innovative performance athletic apparel and training gear', 'https://www.underarmour.com'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM brand WHERE brand_name = 'Under Armour');

INSERT INTO brand (brand_name, description, web_site)
SELECT 'Woodland', 'Rugged outdoor footwear, boots, and adventure apparel', 'https://www.woodlandworldwide.com'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM brand WHERE brand_name = 'Woodland');

INSERT INTO brand (brand_name, description, web_site)
SELECT 'Ray-Ban', 'Iconic luxury sunglasses and premium eyewear', 'https://www.ray-ban.com'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM brand WHERE brand_name = 'Ray-Ban');

INSERT INTO brand (brand_name, description, web_site)
SELECT 'Tommy Hilfiger', 'Classic American designer lifestyle apparel', 'https://www.tommy.com'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM brand WHERE brand_name = 'Tommy Hilfiger');


-- =====================================================================
-- 3. INSERT PRODUCTS ACROSS ALL CATEGORIES
-- =====================================================================

-- ----- CATEGORY: Topwear -----
INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    'Classic Denim Trucker Jacket', 
    3499.00, 
    'Timeless trucker denim jacket in rugged indigo wash with reinforced stitching and metal shank buttons', 
    'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Topwear' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'Levi''s' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = 'Classic Denim Trucker Jacket');

INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    'Oxford Cotton Casual Shirt', 
    2799.00, 
    'Pure breathable cotton button-down casual shirt with embroidered flag logo on chest', 
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Topwear' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'Tommy Hilfiger' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = 'Oxford Cotton Casual Shirt');

INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    'Relaxed Fit Graphic Tee', 
    899.00, 
    'Soft combed organic cotton t-shirt featuring modern minimalist typography art print', 
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Topwear' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'H&M' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = 'Relaxed Fit Graphic Tee');

-- ----- CATEGORY: Bottomwear -----
INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    'Slim Fit Chino Trousers', 
    1899.00, 
    'Sleek tailored stretch-cotton chinos suitable for casual Fridays and smart everyday wear', 
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Bottomwear' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'Zara' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = 'Slim Fit Chino Trousers');

INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    '511 Slim Fit Stretch Jeans', 
    2999.00, 
    'Modern slim-cut denim jeans with added stretch for all-day mobility and classic five-pocket styling', 
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Bottomwear' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'Levi''s' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = '511 Slim Fit Stretch Jeans');

-- ----- CATEGORY: Footwear -----
INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    'Air Max Pulse Sneakers', 
    4999.00, 
    'Revolutionary street sneaker with plush Point-Loaded Air cushioning and breathable textile mesh upper', 
    'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Footwear' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'Nike' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = 'Air Max Pulse Sneakers');

INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    'Ultraboost Light Running Shoes', 
    5499.00, 
    'Lightweight marathon running shoes engineered with responsive Boost midsole and Primeknit upper', 
    'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Footwear' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'Adidas' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = 'Ultraboost Light Running Shoes');

INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    'Leather Adventure Trekking Boots', 
    4299.00, 
    'Heavy-duty nubuck leather outdoor boots with deep-lugged rubber outsoles for extreme terrain grip', 
    'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Footwear' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'Woodland' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = 'Leather Adventure Trekking Boots');

INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    'Retro Suede Casual Sneakers', 
    2499.00, 
    'Iconic heritage low-top suede sneakers with signature Formstrip and vulcanized rubber sole', 
    'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Footwear' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'Puma' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = 'Retro Suede Casual Sneakers');

INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    'Suede Penny Loafers', 
    3299.00, 
    'Sophisticated Italian-style slip-on suede leather loafers with flexible cushioned footbed', 
    'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Footwear' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'Zara' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = 'Suede Penny Loafers');

-- ----- CATEGORY: Accessories -----
INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    'Aviator Classic Polarized Sunglasses', 
    4599.00, 
    'Timeless teardrop gold-tone metal frame sunglasses with green polarized anti-glare lenses', 
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Accessories' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'Ray-Ban' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = 'Aviator Classic Polarized Sunglasses');

INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    'Urban Commuter Laptop Backpack', 
    2499.00, 
    'Water-resistant Storm technology backpack with padded 15-inch laptop sleeve and breathable straps', 
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Accessories' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'Under Armour' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = 'Urban Commuter Laptop Backpack');

INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    'Full Grain Reversible Leather Belt', 
    1299.00, 
    'Handcrafted durable genuine leather belt with rotating metallic buckle (Black to Brown)', 
    'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Accessories' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'Levi''s' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = 'Full Grain Reversible Leather Belt');

INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    'Sport Training Duffel Gym Bag', 
    1799.00, 
    'Medium ventilated gym duffel bag with separated shoe compartment and adjustable shoulder strap', 
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Accessories' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'Adidas' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = 'Sport Training Duffel Gym Bag');

INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    'Bi-Fold Leather Cardholder Wallet', 
    1499.00, 
    'Slim RFID-blocking genuine leather bi-fold wallet with signature tricolor stripe inlay', 
    'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Accessories' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'Tommy Hilfiger' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = 'Bi-Fold Leather Cardholder Wallet');

-- ----- CATEGORY: Winterwear -----
INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    'Feather-Light Puffer Jacket', 
    4499.00, 
    'Thermal insulated water-repellent quilted puffer jacket with detachable hood and fleece pockets', 
    'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Winterwear' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'Zara' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = 'Feather-Light Puffer Jacket');

INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    'Thermal Fleece Windbreaker', 
    3899.00, 
    'Wind-resistant performance coldgear fleece with half-zip mock collar for cold outdoor workouts', 
    'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Winterwear' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'Under Armour' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = 'Thermal Fleece Windbreaker');

INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    'Quilted Heritage Bomber Jacket', 
    5299.00, 
    'Vintage-inspired aviator flight bomber jacket with ribbed cuffs, heavy zip, and premium satin lining', 
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Winterwear' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'Tommy Hilfiger' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = 'Quilted Heritage Bomber Jacket');

INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    'Heavyweight Wool Blend Overcoat', 
    4799.00, 
    'Knee-length tailored single-breasted wool overcoat with notched lapels and back vent', 
    'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Winterwear' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'H&M' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = 'Heavyweight Wool Blend Overcoat');

INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    'Cable Knit Ribbed Wool Sweater', 
    2699.00, 
    'Cozy fisherman style cable-knit sweater with ribbed crew neckline and relaxed drape', 
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Winterwear' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'Zara' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = 'Cable Knit Ribbed Wool Sweater');

-- ----- CATEGORY: Formal Wear -----
INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    'Tailored Wool Blend Blazer', 
    5999.00, 
    'Modern slim fit two-button suit jacket blazer with peaked lapels and interior ticket pocket', 
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Formal Wear' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'Zara' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = 'Tailored Wool Blend Blazer');

INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    'Classic Solid Formal Dress Shirt', 
    2499.00, 
    'Easy-iron wrinkle-free premium cotton dress shirt with spread collar and French button cuffs', 
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Formal Wear' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'Tommy Hilfiger' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = 'Classic Solid Formal Dress Shirt');

INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    'Slim Fit Pleated Formal Trousers', 
    2199.00, 
    'Structured tailored dress trousers with sharp front creases and concealed hook-and-eye closure', 
    'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Formal Wear' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'H&M' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = 'Slim Fit Pleated Formal Trousers');

INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    'Tuxedo Peak Lapel Evening Suit', 
    8999.00, 
    'Luxury black-tie formal 2-piece evening suit with satin shawl lapels and matching dress pants', 
    'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Formal Wear' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'Zara' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = 'Tuxedo Peak Lapel Evening Suit');

-- ----- CATEGORY: Activewear -----
INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    'Pro Compression Training Top', 
    1899.00, 
    'Ultra-tight second-skin fit compression shirt with HeatGear fabric that wicks sweat fast', 
    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Activewear' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'Under Armour' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = 'Pro Compression Training Top');

INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    'Dri-FIT Athletic Track Pants', 
    2499.00, 
    'Tapered athletic sweatpants with breathable mesh panels, ankle zippers, and zip pockets', 
    'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Activewear' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'Nike' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = 'Dri-FIT Athletic Track Pants');

INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    'Aeroready Gym Training Tank', 
    1199.00, 
    'Lightweight sleeveless gym tank top engineered with AEROREADY moisture-absorbing technology', 
    'https://images.unsplash.com/photo-1571945153237-4929e783af4a?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Activewear' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'Adidas' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = 'Aeroready Gym Training Tank');

INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    'Seamless High-Stretch Workout Tights', 
    2199.00, 
    '4-way stretch non-chafing seamless athletic leggings designed for squat-proof mobility', 
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Activewear' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'Under Armour' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = 'Seamless High-Stretch Workout Tights');

INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    'Tech Fleece Full-Zip Track Jacket', 
    3999.00, 
    'Double-sided smooth fleece providing lightweight warmth with signature bonded zippered sleeve pocket', 
    'https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Activewear' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'Nike' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = 'Tech Fleece Full-Zip Track Jacket');

-- ----- CATEGORY: Ethnic Wear -----
INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    'Embroidered Silk Blend Festive Kurta', 
    2299.00, 
    'Traditional festive mandarin collar silk-blend kurta with delicate thread embroidery and side pockets', 
    'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Ethnic Wear' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'Zara' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = 'Embroidered Silk Blend Festive Kurta');

INSERT INTO product (product_name, base_price, product_description, Image_URL, category_id, brand_id)
SELECT 
    'Chikankari Handcrafted Cotton Kurta', 
    1599.00, 
    'Lightweight breathable pure cotton summer kurta featuring handcrafted Lucknowi chikankari motif work', 
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=700&q=80',
    (SELECT category_id FROM category WHERE category_type = 'Ethnic Wear' LIMIT 1),
    (SELECT brand_id FROM brand WHERE brand_name = 'H&M' LIMIT 1)
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_name = 'Chikankari Handcrafted Cotton Kurta');


-- =====================================================================
-- 4. INSERT PRODUCT VARIANTS (Pure Standard SQL)
-- =====================================================================
INSERT INTO product_variant (product_id, color_size, selling_price, is_active)
SELECT p.product_id, v.color_size, v.selling_price, TRUE
FROM product p
JOIN (
    -- Clothing Variants
    SELECT 'Classic Denim Trucker Jacket' AS product_name, 'Indigo-M' AS color_size, 3499.00 AS selling_price UNION ALL
    SELECT 'Classic Denim Trucker Jacket', 'Indigo-L', 3699.00 UNION ALL
    SELECT 'Classic Denim Trucker Jacket', 'WashedBlack-XL', 3799.00 UNION ALL
    SELECT 'Slim Fit Chino Trousers', 'Beige-32', 1899.00 UNION ALL
    SELECT 'Slim Fit Chino Trousers', 'Navy-34', 1899.00 UNION ALL
    SELECT 'Slim Fit Chino Trousers', 'Olive-32', 1999.00 UNION ALL
    SELECT '511 Slim Fit Stretch Jeans', 'DarkBlue-30', 2999.00 UNION ALL
    SELECT '511 Slim Fit Stretch Jeans', 'DarkBlue-32', 2999.00 UNION ALL
    SELECT '511 Slim Fit Stretch Jeans', 'Black-34', 3199.00 UNION ALL
    SELECT 'Oxford Cotton Casual Shirt', 'White-M', 2799.00 UNION ALL
    SELECT 'Oxford Cotton Casual Shirt', 'LightBlue-L', 2799.00 UNION ALL
    SELECT 'Oxford Cotton Casual Shirt', 'Pink-M', 2899.00 UNION ALL
    SELECT 'Relaxed Fit Graphic Tee', 'OffWhite-S', 899.00 UNION ALL
    SELECT 'Relaxed Fit Graphic Tee', 'OffWhite-M', 899.00 UNION ALL
    SELECT 'Relaxed Fit Graphic Tee', 'Charcoal-L', 949.00 UNION ALL

    -- Footwear Variants
    SELECT 'Air Max Pulse Sneakers', 'Grey/Volt-8', 4999.00 UNION ALL
    SELECT 'Air Max Pulse Sneakers', 'Grey/Volt-9', 4999.00 UNION ALL
    SELECT 'Air Max Pulse Sneakers', 'Black/White-10', 5199.00 UNION ALL
    SELECT 'Ultraboost Light Running Shoes', 'White-8', 5499.00 UNION ALL
    SELECT 'Ultraboost Light Running Shoes', 'White-9', 5499.00 UNION ALL
    SELECT 'Ultraboost Light Running Shoes', 'CoreBlack-9', 5499.00 UNION ALL
    SELECT 'Leather Adventure Trekking Boots', 'Camel-8', 4299.00 UNION ALL
    SELECT 'Leather Adventure Trekking Boots', 'Camel-9', 4299.00 UNION ALL
    SELECT 'Leather Adventure Trekking Boots', 'KhakiBrown-10', 4499.00 UNION ALL
    SELECT 'Retro Suede Casual Sneakers', 'ForestGreen-8', 2499.00 UNION ALL
    SELECT 'Retro Suede Casual Sneakers', 'ForestGreen-9', 2499.00 UNION ALL
    SELECT 'Retro Suede Casual Sneakers', 'Navy-9', 2599.00 UNION ALL
    SELECT 'Suede Penny Loafers', 'TanBrown-8', 3299.00 UNION ALL
    SELECT 'Suede Penny Loafers', 'TanBrown-9', 3299.00 UNION ALL
    SELECT 'Suede Penny Loafers', 'DarkBrown-10', 3499.00 UNION ALL

    -- Accessories Variants
    SELECT 'Aviator Classic Polarized Sunglasses', 'Gold/Green-Standard', 4599.00 UNION ALL
    SELECT 'Aviator Classic Polarized Sunglasses', 'Gunmetal/Black-Large', 4799.00 UNION ALL
    SELECT 'Urban Commuter Laptop Backpack', 'Black/Steel-OneSize', 2499.00 UNION ALL
    SELECT 'Urban Commuter Laptop Backpack', 'CamoGrey-OneSize', 2699.00 UNION ALL
    SELECT 'Full Grain Reversible Leather Belt', 'Black/Brown-32', 1299.00 UNION ALL
    SELECT 'Full Grain Reversible Leather Belt', 'Black/Brown-34', 1299.00 UNION ALL
    SELECT 'Sport Training Duffel Gym Bag', 'Black/White-39L', 1799.00 UNION ALL
    SELECT 'Sport Training Duffel Gym Bag', 'NavyBlue-39L', 1899.00 UNION ALL
    SELECT 'Bi-Fold Leather Cardholder Wallet', 'DarkBrown-Free', 1499.00 UNION ALL
    SELECT 'Bi-Fold Leather Cardholder Wallet', 'MidnightBlack-Free', 1599.00 UNION ALL

    -- Winterwear Variants
    SELECT 'Feather-Light Puffer Jacket', 'MatteBlack-M', 4499.00 UNION ALL
    SELECT 'Feather-Light Puffer Jacket', 'MatteBlack-L', 4499.00 UNION ALL
    SELECT 'Feather-Light Puffer Jacket', 'OliveGreen-XL', 4699.00 UNION ALL
    SELECT 'Thermal Fleece Windbreaker', 'SteelGrey-M', 3899.00 UNION ALL
    SELECT 'Thermal Fleece Windbreaker', 'SteelGrey-L', 3899.00 UNION ALL
    SELECT 'Quilted Heritage Bomber Jacket', 'Navy-M', 5299.00 UNION ALL
    SELECT 'Quilted Heritage Bomber Jacket', 'Navy-L', 5299.00 UNION ALL
    SELECT 'Heavyweight Wool Blend Overcoat', 'Camel-M', 4799.00 UNION ALL
    SELECT 'Heavyweight Wool Blend Overcoat', 'Camel-L', 4799.00 UNION ALL
    SELECT 'Cable Knit Ribbed Wool Sweater', 'Cream-M', 2699.00 UNION ALL
    SELECT 'Cable Knit Ribbed Wool Sweater', 'Cream-L', 2699.00 UNION ALL

    -- Formal Wear Variants
    SELECT 'Tailored Wool Blend Blazer', 'Charcoal-38R', 5999.00 UNION ALL
    SELECT 'Tailored Wool Blend Blazer', 'Charcoal-40R', 5999.00 UNION ALL
    SELECT 'Tailored Wool Blend Blazer', 'MidnightNavy-42R', 6299.00 UNION ALL
    SELECT 'Classic Solid Formal Dress Shirt', 'CrispWhite-39', 2499.00 UNION ALL
    SELECT 'Classic Solid Formal Dress Shirt', 'CrispWhite-40', 2499.00 UNION ALL
    SELECT 'Slim Fit Pleated Formal Trousers', 'SlateGrey-32', 2199.00 UNION ALL
    SELECT 'Slim Fit Pleated Formal Trousers', 'SlateGrey-34', 2199.00 UNION ALL
    SELECT 'Tuxedo Peak Lapel Evening Suit', 'JetBlack-38', 8999.00 UNION ALL
    SELECT 'Tuxedo Peak Lapel Evening Suit', 'JetBlack-40', 8999.00 UNION ALL

    -- Activewear Variants
    SELECT 'Pro Compression Training Top', 'Black-M', 1899.00 UNION ALL
    SELECT 'Pro Compression Training Top', 'Black-L', 1899.00 UNION ALL
    SELECT 'Dri-FIT Athletic Track Pants', 'Black/White-M', 2499.00 UNION ALL
    SELECT 'Dri-FIT Athletic Track Pants', 'Black/White-L', 2499.00 UNION ALL
    SELECT 'Aeroready Gym Training Tank', 'SolarRed-M', 1199.00 UNION ALL
    SELECT 'Aeroready Gym Training Tank', 'CoreBlack-L', 1249.00 UNION ALL
    SELECT 'Seamless High-Stretch Workout Tights', 'HeatherCharcoal-S', 2199.00 UNION ALL
    SELECT 'Seamless High-Stretch Workout Tights', 'HeatherCharcoal-M', 2199.00 UNION ALL
    SELECT 'Tech Fleece Full-Zip Track Jacket', 'HeatherGrey-M', 3999.00 UNION ALL
    SELECT 'Tech Fleece Full-Zip Track Jacket', 'Black-XL', 4199.00 UNION ALL

    -- Ethnic Wear Variants
    SELECT 'Embroidered Silk Blend Festive Kurta', 'Maroon-M', 2299.00 UNION ALL
    SELECT 'Embroidered Silk Blend Festive Kurta', 'Maroon-L', 2299.00 UNION ALL
    SELECT 'Embroidered Silk Blend Festive Kurta', 'RoyalGold-L', 2499.00 UNION ALL
    SELECT 'Chikankari Handcrafted Cotton Kurta', 'PureWhite-M', 1599.00 UNION ALL
    SELECT 'Chikankari Handcrafted Cotton Kurta', 'PureWhite-L', 1599.00 UNION ALL
    SELECT 'Chikankari Handcrafted Cotton Kurta', 'SkyBlue-M', 1699.00
) v ON p.product_name = v.product_name
WHERE NOT EXISTS (
    SELECT 1 FROM product_variant pv 
    WHERE pv.product_id = p.product_id AND pv.color_size = v.color_size
);


-- =====================================================================
-- 5. SEED INVENTORY FOR ALL VARIANTS ACROSS BRANCHES (Surat, Ahmedabad, Mumbai)
-- =====================================================================
-- Branch 1: Surat Central
INSERT INTO inventory (variant_id, branch_id, quantity, reorder_level)
SELECT 
    pv.variant_id,
    1 AS branch_id,
    28 AS quantity,
    5 AS reorder_level
FROM product_variant pv
WHERE NOT EXISTS (
    SELECT 1 FROM inventory inv 
    WHERE inv.variant_id = pv.variant_id AND inv.branch_id = 1
);

-- Branch 2: Ahmedabad West
INSERT INTO inventory (variant_id, branch_id, quantity, reorder_level)
SELECT 
    pv.variant_id,
    2 AS branch_id,
    18 AS quantity,
    5 AS reorder_level
FROM product_variant pv
WHERE NOT EXISTS (
    SELECT 1 FROM inventory inv 
    WHERE inv.variant_id = pv.variant_id AND inv.branch_id = 2
);

-- Branch 3: Mumbai Andheri
INSERT INTO inventory (variant_id, branch_id, quantity, reorder_level)
SELECT 
    pv.variant_id,
    3 AS branch_id,
    15 AS quantity,
    5 AS reorder_level
FROM product_variant pv
WHERE NOT EXISTS (
    SELECT 1 FROM inventory inv 
    WHERE inv.variant_id = pv.variant_id AND inv.branch_id = 3
);


-- =====================================================================
-- 6. INSERT REVIEWS AND RATINGS FOR NEW PRODUCTS
-- =====================================================================
INSERT INTO review (product_id, cust_id, review_date, rating, comments)
SELECT 
    p.product_id,
    1,
    CURDATE(),
    5,
    'Exceptional craftsmanship, high quality fabric and true to size fit.'
FROM product p
WHERE p.product_name IN (
    'Classic Denim Trucker Jacket', 
    'Air Max Pulse Sneakers', 
    'Feather-Light Puffer Jacket', 
    'Tailored Wool Blend Blazer', 
    'Tech Fleece Full-Zip Track Jacket',
    'Embroidered Silk Blend Festive Kurta'
)
AND NOT EXISTS (
    SELECT 1 FROM review r WHERE r.product_id = p.product_id AND r.cust_id = 1
);

INSERT INTO review (product_id, cust_id, review_date, rating, comments)
SELECT 
    p.product_id,
    2,
    CURDATE(),
    5,
    'Super comfortable! Looks even better in person than in pictures.'
FROM product p
WHERE p.product_name IN (
    'Ultraboost Light Running Shoes', 
    'Aviator Classic Polarized Sunglasses', 
    '511 Slim Fit Stretch Jeans', 
    'Classic Solid Formal Dress Shirt', 
    'Pro Compression Training Top',
    'Chikankari Handcrafted Cotton Kurta'
)
AND NOT EXISTS (
    SELECT 1 FROM review r WHERE r.product_id = p.product_id AND r.cust_id = 2
);

INSERT INTO review (product_id, cust_id, review_date, rating, comments)
SELECT 
    p.product_id,
    3,
    CURDATE(),
    4,
    'Great everyday piece, versatile styling and durable build.'
FROM product p
WHERE p.product_name IN (
    'Slim Fit Chino Trousers', 
    'Leather Adventure Trekking Boots', 
    'Heavyweight Wool Blend Overcoat', 
    'Dri-FIT Athletic Track Pants', 
    'Bi-Fold Leather Cardholder Wallet'
)
AND NOT EXISTS (
    SELECT 1 FROM review r WHERE r.product_id = p.product_id AND r.cust_id = 3
);


-- =====================================================================
-- 7. VERIFICATION & STATUS REPORT
-- =====================================================================
SELECT 'DATABASE CATALOG UPDATE COMPLETED SUCCESSFULLY!' AS status;

SELECT 
    c.category_type AS category,
    COUNT(DISTINCT p.product_id) AS total_products,
    COUNT(DISTINCT pv.variant_id) AS total_variants,
    COALESCE(SUM(inv.quantity), 0) AS total_stock_units
FROM category c
LEFT JOIN product p ON c.category_id = p.category_id
LEFT JOIN product_variant pv ON p.product_id = pv.product_id
LEFT JOIN inventory inv ON pv.variant_id = inv.variant_id
GROUP BY c.category_id, c.category_type
ORDER BY total_products DESC;
