-- =====================================================================
-- THREADCRAFT DATABASE MIGRATION SCRIPT
-- =====================================================================
-- Purpose: Divide the generic 'Clothing' category into two distinct 
--          categories: 'Upper Body' and 'Lower Body'.
--
-- Actions:
--   1. Inserts 'Upper Body' category (if not exists)
--   2. Inserts 'Lower Body' category (if not exists)
--   3. Reassigns Upper Body items ('Running T-Shirt', 'Hoodie', 
--      'Classic Denim Trucker Jacket', 'Oxford Cotton Casual Shirt', 
--      'Relaxed Fit Graphic Tee') to 'Upper Body'
--   4. Reassigns Lower Body items ('Training Shorts', 
--      'Slim Fit Chino Trousers', '511 Slim Fit Stretch Jeans') 
--      to 'Lower Body'
--   5. Safely handles any remaining products mapped to 'Clothing'
--   6. Deletes the legacy 'Clothing' category once unreferenced
--   7. Displays summary verification
--
-- Compatibility: Safe & Idempotent for MySQL 8.0+ / Workbench / CLI
-- =====================================================================

USE retail_db;

-- Temporarily disable safe update mode for bulk reassignment
SET SQL_SAFE_UPDATES = 0;

-- ---------------------------------------------------------------------
-- STEP 1: Insert new 'Upper Body' category
-- ---------------------------------------------------------------------
INSERT INTO category (category_type, description)
SELECT 'Upper Body', 'T-shirts, shirts, jackets, hoodies, sweaters, and top apparel'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM category WHERE category_type = 'Upper Body'
);

-- ---------------------------------------------------------------------
-- STEP 2: Insert new 'Lower Body' category
-- ---------------------------------------------------------------------
INSERT INTO category (category_type, description)
SELECT 'Lower Body', 'Jeans, trousers, chinos, shorts, track pants, and bottom apparel'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM category WHERE category_type = 'Lower Body'
);

-- Store category IDs in session variables
SET @upper_id = (SELECT category_id FROM category WHERE category_type = 'Upper Body' LIMIT 1);
SET @lower_id = (SELECT category_id FROM category WHERE category_type = 'Lower Body' LIMIT 1);
SET @cloth_id = (SELECT category_id FROM category WHERE category_type = 'Clothing' LIMIT 1);

-- ---------------------------------------------------------------------
-- STEP 3: Reassign Upper Body products currently under 'Clothing'
-- ---------------------------------------------------------------------
UPDATE product
SET category_id = @upper_id
WHERE (@cloth_id IS NOT NULL AND category_id = @cloth_id)
  AND (
       product_name IN (
           'Running T-Shirt',
           'Hoodie',
           'Classic Denim Trucker Jacket',
           'Oxford Cotton Casual Shirt',
           'Relaxed Fit Graphic Tee'
       )
       OR product_name LIKE '%T-Shirt%'
       OR product_name LIKE '%Tee%'
       OR product_name LIKE '%Shirt%'
       OR product_name LIKE '%Hoodie%'
       OR product_name LIKE '%Jacket%'
       OR product_name LIKE '%Sweater%'
       OR product_name LIKE '%Top%'
  );

-- ---------------------------------------------------------------------
-- STEP 4: Reassign Lower Body products currently under 'Clothing'
-- ---------------------------------------------------------------------
UPDATE product
SET category_id = @lower_id
WHERE (@cloth_id IS NOT NULL AND category_id = @cloth_id)
  AND (
       product_name IN (
           'Training Shorts',
           'Slim Fit Chino Trousers',
           '511 Slim Fit Stretch Jeans'
       )
       OR product_name LIKE '%Shorts%'
       OR product_name LIKE '%Trousers%'
       OR product_name LIKE '%Jeans%'
       OR product_name LIKE '%Pants%'
       OR product_name LIKE '%Tights%'
       OR product_name LIKE '%Leggings%'
  );

-- ---------------------------------------------------------------------
-- STEP 5: Fallback: Move any remaining products under 'Clothing' to 'Upper Body'
-- ---------------------------------------------------------------------
UPDATE product
SET category_id = @upper_id
WHERE @cloth_id IS NOT NULL AND category_id = @cloth_id;

-- ---------------------------------------------------------------------
-- STEP 6: Safely delete the deprecated 'Clothing' category
-- (Only deletes if no foreign-key references remain)
-- ---------------------------------------------------------------------
DELETE FROM category 
WHERE category_type = 'Clothing'
  AND NOT EXISTS (
      SELECT 1 FROM product WHERE product.category_id = category.category_id
  );

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;

-- ---------------------------------------------------------------------
-- STEP 7: Verification Output
-- ---------------------------------------------------------------------
SELECT 
    c.category_id,
    c.category_type,
    c.description,
    COUNT(p.product_id) AS product_count
FROM category c
LEFT JOIN product p ON c.category_id = p.category_id
GROUP BY c.category_id, c.category_type, c.description
ORDER BY c.category_id ASC;

SELECT 
    p.product_id,
    p.product_name,
    c.category_type,
    b.brand_name,
    p.base_price
FROM product p
JOIN category c ON p.category_id = c.category_id
JOIN brand b ON p.brand_id = b.brand_id
WHERE c.category_type IN ('Upper Body', 'Lower Body')
ORDER BY c.category_type, p.product_id;
