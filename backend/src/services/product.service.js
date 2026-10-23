import * as productModel from "../models/product.model.js";

export const fetchAllProducts = async () => {
    return await productModel.getAllProducts();
};

export const fetchProductById = async (id) => {
    return await productModel.getProductById(id);
};
