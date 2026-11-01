import * as productService from "../services/product.service.js";
import { appendFileSync, mkdirSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_FILE = path.resolve(__dirname, "../../..", "database", "db_changes.sql");

// Ensure database directory exists
const logDir = path.dirname(LOG_FILE);
if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true });
}

function logDbChange(action, details) {
    const timestamp = new Date().toISOString();
    const entry = `-- [${timestamp}] ${action}: ${details}\n`;
    try {
        appendFileSync(LOG_FILE, entry);
    } catch (err) {
        console.warn("Could not write to db_changes.sql:", err.message);
    }
}

export const getProducts = async (req, res, next) => {
    try {
        const { category, brand, search } = req.query;
        const products = await productService.fetchAllProducts({ category, brand, search });
        res.json(products);
    } catch (error) {
        console.error("Database error in getProducts:", error);
        res.status(500).json({
            message: "Failed to fetch products from MySQL database",
            error: error.message
        });
    }
};

export const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await productService.fetchProductById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(product);
    } catch (error) {
        console.error("Database error in getProductById:", error);
        res.status(500).json({
            message: "Failed to fetch product details",
            error: error.message
        });
    }
};

export const createProduct = async (req, res, next) => {
    try {
        const {
            product_name,
            category_id,
            brand_id,
            base_price,
            product_description,
            image_url,
            color_size,
            selling_price,
            initial_stock,
            branch_id
        } = req.body;

        // Validation 1: Product Name
        if (!product_name || typeof product_name !== "string" || !product_name.trim()) {
            return res.status(400).json({ message: "Product name is required." });
        }
        if (product_name.trim().length < 3) {
            return res.status(400).json({ message: "Product name must be at least 3 characters long." });
        }
        if (product_name.trim().length > 150) {
            return res.status(400).json({ message: "Product name cannot exceed 150 characters." });
        }

        // Validation 2: Category
        const parsedCategoryId = Number(category_id);
        if (!category_id || isNaN(parsedCategoryId) || parsedCategoryId <= 0) {
            return res.status(400).json({ message: "Please select a valid category from the list." });
        }

        // Validation 3: Brand
        const parsedBrandId = Number(brand_id);
        if (!brand_id || isNaN(parsedBrandId) || parsedBrandId <= 0) {
            return res.status(400).json({ message: "Please select a valid brand from the list." });
        }

        // Validation 4: Product Image URL is Mandatory (Request 2)
        if (!image_url || typeof image_url !== "string" || !image_url.trim()) {
            return res.status(400).json({ message: "Product image URL is mandatory." });
        }
        try {
            const parsedUrl = new URL(image_url.trim());
            if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                return res.status(400).json({ message: "Product image URL must start with http:// or https://" });
            }
        } catch (_) {
            return res.status(400).json({ message: "Invalid product image URL format. Please provide a valid web link." });
        }

        // Mode: Add Product Only (Request 3)
        if (req.body.product_only || (!color_size && !selling_price)) {
            const newProduct = await productService.addProductOnly({
                product_name: product_name.trim(),
                category_id: parsedCategoryId,
                brand_id: parsedBrandId,
                product_description: product_description?.trim() || "",
                image_url: image_url.trim()
            });

            logDbChange("INSERT PRODUCT", `product_id=${newProduct.id}, name="${product_name.trim()}", category_id=${parsedCategoryId}, brand_id=${parsedBrandId}`);

            return res.status(201).json({
                message: `Product '${product_name.trim()}' created successfully (ID #${newProduct.id})`,
                product: newProduct
            });
        }

        // Mode: Add Product with Initial Variant
        if (!color_size || typeof color_size !== "string" || !color_size.trim()) {
            return res.status(400).json({ message: "Variant color and size is required (e.g. 'Black-M' or 'Free-Size')." });
        }
        if (color_size.trim().length > 50) {
            return res.status(400).json({ message: "Variant color and size cannot exceed 50 characters." });
        }

        const rawSellingPrice = selling_price !== undefined && selling_price !== "" ? selling_price : base_price;
        const parsedSellingPrice = Number(rawSellingPrice);
        if (rawSellingPrice === undefined || isNaN(parsedSellingPrice) || parsedSellingPrice <= 0) {
            return res.status(400).json({ message: "Variant selling price must be a positive number greater than ₹0." });
        }
        if (parsedSellingPrice > 10000000) {
            return res.status(400).json({ message: "Selling price cannot exceed ₹1,00,00,000." });
        }

        const parsedStock = initial_stock !== undefined && initial_stock !== "" ? Number(initial_stock) : 0;
        if (isNaN(parsedStock) || parsedStock < 0 || !Number.isInteger(parsedStock)) {
            return res.status(400).json({ message: "Initial stock quantity must be a non-negative whole integer (e.g. 0, 10, 50)." });
        }

        const newProduct = await productService.addProductWithVariant({
            product_name: product_name.trim(),
            category_id: parsedCategoryId,
            brand_id: parsedBrandId,
            product_description: product_description?.trim() || "",
            image_url: image_url.trim(),
            color_size: color_size.trim(),
            selling_price: parsedSellingPrice,
            initial_stock: parsedStock,
            discount_percent: Number(req.body.discount_percent) || 0,
            branch_id: Number(branch_id) || 1
        });

        logDbChange("INSERT PRODUCT", `product_id=${newProduct.id}, name="${product_name.trim()}", category_id=${parsedCategoryId}, brand_id=${parsedBrandId}, variant="${color_size.trim()}", selling_price=${parsedSellingPrice}, stock=${parsedStock}`);

        res.status(201).json({
            message: "Product and initial variant added successfully to database",
            product: newProduct
        });
    } catch (error) {
        console.error("Database error in createProduct:", error);

        // Database foreign key or constraint errors
        if (error.code === "ER_NO_REFERENCED_ROW_2" || (error.sqlMessage && error.sqlMessage.includes("foreign key constraint fails"))) {
            return res.status(400).json({
                message: "Database Constraint Error: The selected Category or Brand does not exist in the database.",
                error: error.message
            });
        }

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
                message: "Duplicate Entry Error: A product or variant with this unique specification already exists.",
                error: error.message
            });
        }

        if (error.sqlState === "45000") {
            return res.status(400).json({
                message: error.sqlMessage || error.message,
                error: error.message
            });
        }

        res.status(500).json({
            message: "Failed to create product in database: " + (error.sqlMessage || error.message),
            error: error.message
        });
    }
};

export const updateVariant = async (req, res, next) => {
    try {
        const { variantId } = req.params;
        const { color_size, selling_price, is_active, discount_percent } = req.body;

        const parsedVariantId = Number(variantId);
        if (!variantId || isNaN(parsedVariantId) || parsedVariantId <= 0) {
            return res.status(400).json({ message: "Invalid variant ID supplied." });
        }

        if (!color_size || typeof color_size !== "string" || !color_size.trim()) {
            return res.status(400).json({ message: "Variant color and size is required (e.g. 'Black-M')." });
        }

        if (color_size.trim().length > 50) {
            return res.status(400).json({ message: "Variant color and size cannot exceed 50 characters." });
        }

        const parsedPrice = Number(selling_price);
        if (selling_price === undefined || selling_price === null || isNaN(parsedPrice) || parsedPrice <= 0) {
            return res.status(400).json({ message: "Selling price must be a valid positive number greater than ₹0." });
        }
        if (parsedPrice > 10000000) {
            return res.status(400).json({ message: "Selling price cannot exceed ₹1,00,00,000." });
        }

        const parsedDiscount = discount_percent !== undefined && discount_percent !== null && discount_percent !== ""
            ? Number(discount_percent)
            : 0;
        if (isNaN(parsedDiscount) || parsedDiscount < 0 || parsedDiscount > 99) {
            return res.status(400).json({ message: "Discount percentage must be a number between 0% and 99%." });
        }

        const result = await productService.updateProductVariant(parsedVariantId, {
            color_size: color_size.trim(),
            selling_price: parsedPrice,
            is_active: is_active !== undefined ? Boolean(is_active) : true,
            discount_percent: Math.round(parsedDiscount)
        });

        logDbChange("UPDATE VARIANT", `variant_id=${parsedVariantId}, color_size="${color_size.trim()}", selling_price=${parsedPrice}, discount_percent=${Math.round(parsedDiscount)}%, is_active=${is_active !== undefined ? Boolean(is_active) : true}`);

        res.json({
            message: "Product variant updated successfully using sp_update_product_variant",
            result
        });
    } catch (error) {
        console.error("Database error in updateVariant:", error);

        if (error.sqlState === "45000") {
            return res.status(400).json({
                message: error.sqlMessage || error.message,
                error: error.message
            });
        }

        res.status(500).json({
            message: "Failed to update variant: " + (error.sqlMessage || error.message),
            error: error.message
        });
    }
};

export const addVariant = async (req, res, next) => {
    try {
        const productId = req.params?.id || req.body?.product_id;
        const { color_size, selling_price, initial_stock, discount_percent, branch_id } = req.body || {};

        const cleanProductId = Number(productId);
        if (!productId || isNaN(cleanProductId) || cleanProductId <= 0) {
            return res.status(400).json({ message: "Valid Product ID is required." });
        }

        const existing = await productService.fetchProductById(cleanProductId);
        if (!existing) {
            return res.status(404).json({ message: `Product #${cleanProductId} does not exist.` });
        }

        if (!color_size || typeof color_size !== "string" || !color_size.trim()) {
            return res.status(400).json({ message: "Variant color and size is required (e.g. 'Black-M')." });
        }
        if (color_size.trim().length > 50) {
            return res.status(400).json({ message: "Variant color and size cannot exceed 50 characters." });
        }

        const parsedPrice = Number(selling_price);
        if (selling_price === undefined || isNaN(parsedPrice) || parsedPrice <= 0) {
            return res.status(400).json({ message: "Variant selling price must be greater than ₹0." });
        }
        if (parsedPrice > 10000000) {
            return res.status(400).json({ message: "Selling price cannot exceed ₹1,00,00,000." });
        }

        const parsedDiscount = discount_percent !== undefined && discount_percent !== null && discount_percent !== ""
            ? Number(discount_percent)
            : 0;
        if (isNaN(parsedDiscount) || parsedDiscount < 0 || parsedDiscount > 99) {
            return res.status(400).json({ message: "Discount percentage must be between 0% and 99%." });
        }

        const parsedStock = initial_stock !== undefined && initial_stock !== "" ? Number(initial_stock) : 0;

        const result = await productService.addVariantToProduct(cleanProductId, {
            color_size: color_size.trim(),
            selling_price: parsedPrice,
            initial_stock: parsedStock,
            discount_percent: Math.round(parsedDiscount),
            branch_id: Number(branch_id) || 1
        });

        logDbChange("INSERT VARIANT", `product_id=${cleanProductId}, variant_id=${result.variant_id}, color_size="${color_size.trim()}", selling_price=${parsedPrice}, discount_percent=${Math.round(parsedDiscount)}%, stock=${parsedStock}`);

        res.status(201).json({
            message: `Variant '${color_size.trim()}' added successfully to Product #${cleanProductId} (${existing.name})`,
            variant: result
        });
    } catch (error) {
        console.error("Database error in addVariant:", error);
        if (error.sqlState === "45000") {
            return res.status(400).json({ message: error.sqlMessage || error.message });
        }
        res.status(500).json({ message: "Failed to add variant: " + (error.sqlMessage || error.message) });
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { product_name, product_description, image_url } = req.body;

        const parsedId = Number(id);
        if (!id || isNaN(parsedId) || parsedId <= 0) {
            return res.status(400).json({ message: "Invalid product ID supplied." });
        }

        const existing = await productService.fetchProductById(parsedId);
        if (!existing) {
            return res.status(404).json({ message: `Product #${parsedId} not found in database.` });
        }

        const newName = product_name !== undefined && String(product_name).trim() ? String(product_name).trim() : existing.name;
        const newDesc = product_description !== undefined ? String(product_description).trim() : (existing.description || "");
        let newImage = image_url !== undefined ? String(image_url).trim() : (existing.image || "");

        if (!newName) {
            return res.status(400).json({ message: "Product name cannot be empty." });
        }

        if (newImage) {
            try {
                const parsedUrl = new URL(newImage);
                if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
                    return res.status(400).json({ message: "Image URL must start with http:// or https://" });
                }
            } catch (err) {
                return res.status(400).json({ message: "Invalid image URL format. Please provide a valid web URL." });
            }
        }

        const result = await productService.updateProduct(parsedId, {
            product_name: newName,
            product_description: newDesc,
            image_url: newImage || null
        });

        logDbChange("UPDATE PRODUCT", `product_id=${parsedId}, name="${newName}", description="${newDesc}"`);

        res.json({
            message: "Product updated successfully using sp_update_product",
            result,
            product: {
                id: parsedId,
                name: newName,
                price: newPrice,
                description: newDesc,
                image: newImage || null
            }
        });
    } catch (error) {
        console.error("Database error in updateProduct:", error);
        if (error.sqlState === "45000") {
            return res.status(400).json({
                message: error.sqlMessage || error.message,
                error: error.message
            });
        }
        res.status(500).json({
            message: "Failed to update product in database: " + (error.sqlMessage || error.message),
            error: error.message
        });
    }
};

export const addReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rating, comments, cust_id, customer_name } = req.body;

        const parsedProductId = Number(id);
        if (!parsedProductId || isNaN(parsedProductId)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const cleanRating = Number(rating);
        if (!cleanRating || cleanRating < 1 || cleanRating > 5) {
            return res.status(400).json({ message: "Rating must be a number between 1 and 5" });
        }

        const result = await productService.addProductReview(parsedProductId, {
            cust_id: cust_id || req.user?.cust_id || req.user?.id || null,
            customer_name: customer_name || req.user?.name || "Customer",
            rating: cleanRating,
            comments: comments || ""
        });

        logDbChange("INSERT REVIEW", `product_id=${parsedProductId}, rating=${cleanRating}, customer="${customer_name || 'Customer'}"`);

        const updatedProduct = await productService.fetchProductById(parsedProductId);

        res.status(201).json({
            message: "Review submitted successfully",
            result,
            product: updatedProduct
        });
    } catch (error) {
        console.error("Database error in addReview:", error);
        if (error.sqlState === "45000") {
            return res.status(400).json({
                message: error.sqlMessage || error.message,
                error: error.message
            });
        }
        res.status(500).json({
            message: "Failed to submit review: " + (error.sqlMessage || error.message),
            error: error.message
        });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const reviewId = req.params.reviewId || req.params.id;
        const productId = req.params.productId || (req.params.reviewId ? req.params.id : null);
        const parsedReviewId = Number(reviewId);

        if (!parsedReviewId || isNaN(parsedReviewId)) {
            return res.status(400).json({ message: "Invalid review ID" });
        }

        const result = await productService.removeProductReview(parsedReviewId);
        logDbChange("DELETE REVIEW", `review_id=${parsedReviewId}${productId ? `, product_id=${productId}` : ""}`);

        let updatedProduct = null;
        if (productId) {
            const parsedProductId = Number(productId);
            if (parsedProductId && !isNaN(parsedProductId)) {
                updatedProduct = await productService.fetchProductById(parsedProductId);
            }
        }

        res.status(200).json({
            message: "Review removed successfully",
            result,
            product: updatedProduct
        });
    } catch (error) {
        console.error("Database error in deleteReview:", error);
        if (error.sqlState === "45000") {
            return res.status(400).json({
                message: error.sqlMessage || error.message,
                error: error.message
            });
        }
        res.status(500).json({
            message: "Failed to remove review: " + (error.sqlMessage || error.message),
            error: error.message
        });
    }
};

export const updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { delta, quantity, branch_id, variant_id } = req.body;
        const parsedProductId = Number(id);

        if (!parsedProductId || isNaN(parsedProductId) || parsedProductId <= 0) {
            return res.status(400).json({ success: false, message: "Invalid product ID supplied." });
        }

        if (delta === undefined && quantity === undefined) {
            return res.status(400).json({ success: false, message: "Either 'delta' or 'quantity' is required to adjust stock." });
        }

        const result = await productService.adjustProductStock(parsedProductId, {
            delta: delta !== undefined ? Number(delta) : undefined,
            quantity: quantity !== undefined ? Number(quantity) : undefined,
            branch_id: branch_id || req.user?.branch_id || 1,
            variant_id: variant_id ? Number(variant_id) : undefined
        });

        logDbChange("UPDATE INVENTORY", `product_id=${parsedProductId}, delta=${delta}, branch_id=${result.branch_id}, new_total_stock=${result.total_stock}`);

        res.status(200).json({
            success: true,
            message: `Stock updated successfully to ${result.total_stock} units in MySQL database`,
            ...result
        });
    } catch (error) {
        console.error("Database error in updateStock:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update stock in database: " + (error.sqlMessage || error.message),
            error: error.message
        });
    }
};

