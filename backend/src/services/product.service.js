import * as productModel from "../models/product.model.js";

const computeDiscountPercent = (prod) => {
    if (prod.discount_percent !== undefined && prod.discount_percent !== null) {
        return Number(prod.discount_percent);
    }
    const id = Number(prod.id || prod.product_id || 1);
    const cat = (prod.category || "").toLowerCase();
    const name = (prod.name || prod.product_name || "").toLowerCase();

    if (cat.includes("shoes") || cat.includes("footwear") || name.includes("shoe") || name.includes("sneaker") || name.includes("boot")) {
        return 30;
    }
    if (cat.includes("winter") || cat.includes("jacket") || cat.includes("hoodie") || name.includes("jacket") || name.includes("coat") || name.includes("hoodie")) {
        return 25;
    }
    if (cat.includes("ethnic") || cat.includes("festive") || name.includes("kurta")) {
        return 35;
    }
    if (cat.includes("accessory") || cat.includes("accessories") || name.includes("cap") || name.includes("belt") || name.includes("wallet")) {
        return 15;
    }
    if (cat.includes("formal") || name.includes("suit") || name.includes("blazer") || name.includes("trouser")) {
        return 20;
    }
    if (name.includes("t-shirt") || name.includes("tee") || name.includes("tank")) {
        return 20;
    }
    if (name.includes("jeans") || name.includes("chino")) {
        return 18;
    }

    const discountTiers = [20, 25, 15, 30, 22, 18, 35, 28];
    return discountTiers[id % discountTiers.length];
};

const formatProduct = (prod) => {
    const price = Number(prod.price);
    const discountPercent = computeDiscountPercent(prod);
    const originalPrice = discountPercent > 0 && price > 0
        ? Math.round(price / (1 - discountPercent / 100))
        : price;

    return {
        ...prod,
        price,
        original_price: originalPrice,
        discount_percent: discountPercent,
        has_active_variant: Number(prod.has_active_variant || 0),
        rating: Number(prod.rating),
        review_count: Number(prod.review_count),
        total_stock: Number(prod.total_stock),
        variants: Array.isArray(prod.variants) ? prod.variants : [],
        reviews: Array.isArray(prod.reviews) ? prod.reviews : []
    };
};

export const fetchAllProducts = async (filters) => {
    const products = await productModel.getAllProducts(filters);
    return products.map(formatProduct);
};

export const fetchProductById = async (id) => {
    const product = await productModel.getProductById(id);
    if (!product) return null;
    return formatProduct(product);
};

export const addProductWithVariant = async (data) => {
    const result = await productModel.createProductWithVariant(data);
    const createdProduct = await productModel.getProductById(result.productId);
    return formatProduct(createdProduct);
};

export const addProductOnly = async (data) => {
    const result = await productModel.createProductOnly(data);
    const createdProduct = await productModel.getProductById(result.productId);
    return formatProduct(createdProduct);
};

export const addVariantToProduct = async (productId, data) => {
    return await productModel.addVariantToProduct(productId, data);
};

export const updateProductVariant = async (variantId, data) => {
    return await productModel.updateProductVariant(variantId, data);
};

export const updateProduct = async (id, data) => {
    return await productModel.updateProduct(id, data);
};

export const addProductReview = async (productId, data) => {
    return await productModel.createReview({ product_id: productId, ...data });
};

export const removeProductReview = async (reviewId) => {
    return await productModel.deleteReview(reviewId);
};

export const adjustProductStock = async (productId, data) => {
    return await productModel.updateProductStock(productId, data);
};



