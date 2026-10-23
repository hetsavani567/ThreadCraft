import * as productModel from "../models/product.model.js";

const formatProduct = (prod) => ({
    ...prod,
    price: Number(prod.price),
    rating: Number(prod.rating),
    review_count: Number(prod.review_count),
    total_stock: Number(prod.total_stock),
    variants: Array.isArray(prod.variants) ? prod.variants : []
});

export const fetchAllProducts = async (filters) => {
    const products = await productModel.getAllProducts(filters);
    return products.map(formatProduct);
};

export const fetchProductById = async (id) => {
    const product = await productModel.getProductById(id);
    if (!product) return null;
    return formatProduct(product);
};
