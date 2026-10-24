import * as productModel from "../models/product.model.js";
import { formatDbError } from "../db/index.js";
import { filterFallbackProducts, fallbackProducts } from "../data/fallbackProducts.js";

const formatProduct = (prod) => {
    let variants = [];
    if (Array.isArray(prod.variants)) {
        variants = prod.variants;
    } else if (typeof prod.variants === "string") {
        try {
            const parsed = JSON.parse(prod.variants);
            variants = Array.isArray(parsed) ? parsed : [];
        } catch {
            variants = [];
        }
    }

    return {
        ...prod,
        price: Number(prod.price) || 0,
        rating: Number(prod.rating) || 5.0,
        review_count: Number(prod.review_count) || 0,
        total_stock: Number(prod.total_stock) || 0,
        variants
    };
};

export const fetchAllProducts = async (filters) => {
    try {
        const products = await productModel.getAllProducts(filters);
        return products.map(formatProduct);
    } catch (error) {
        console.warn(`[Products Service] MySQL fetch failed (${formatDbError(error)}). Serving fallback catalog.`);
        return filterFallbackProducts(filters);
    }
};

export const fetchProductById = async (id) => {
    try {
        const product = await productModel.getProductById(id);
        if (product) return formatProduct(product);
    } catch (error) {
        console.warn(`[Products Service] MySQL fetch by ID failed (${formatDbError(error)}).`);
    }

    const fallback = fallbackProducts.find((p) => String(p.id) === String(id));
    return fallback || null;
};
