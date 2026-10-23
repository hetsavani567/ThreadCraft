import * as productService from "../services/product.service.js";

export const getProducts = async (req, res, next) => {
    try {
        const products = await productService.fetchAllProducts();
        res.json(products);
    } catch (error) {
        console.error("Database error in getProducts:", error);
        next(error);
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
        next(error);
    }
};
