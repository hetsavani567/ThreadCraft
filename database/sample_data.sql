-- Sample data for ThreadCraft Retail Clothing Store

USE threadcraft_db;

-- Insert Categories
INSERT INTO category (category_type) VALUES
('Men'),
('Women'),
('Accessories')
ON DUPLICATE KEY UPDATE category_type = VALUES(category_type);

-- Insert Brands
INSERT INTO brand (brand_name) VALUES
('Thread & Co.'),
('DenimWorks'),
('UrbanEssence'),
('SoleCraft')
ON DUPLICATE KEY UPDATE brand_name = VALUES(brand_name);

-- Insert Sample Products
INSERT INTO product (product_name, base_price, product_description, category_id, brand_id) VALUES
('Classic Cotton Shirt', 799.00, 'Everyday comfort, timeless style', 1, 1),
('Casual Summer Top', 599.00, 'A light and versatile essential', 2, 3),
('Everyday Denim', 1199.00, 'Made for your daily adventures', 1, 2),
('Minimal Shoulder Bag', 899.00, 'A simple finishing touch', 3, 1),
('Essential White Tee', 499.00, 'An easy everyday favourite', 2, 3),
('Classic Sneakers', 1499.00, 'Step out with confidence and ease', 1, 4);
