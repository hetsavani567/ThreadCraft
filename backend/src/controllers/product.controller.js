import * as productService from "../services/product.service.js";

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
