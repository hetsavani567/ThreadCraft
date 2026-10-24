import * as categoryModel from "../models/category.model.js";
import { formatDbError } from "../db/index.js";
import { fallbackCategories } from "../data/fallbackProducts.js";

export const fetchAllCategories = async () => {
    try {
        const categories = await categoryModel.getAllCategories();
        if (Array.isArray(categories) && categories.length > 0) {
            return categories;
        }
    } catch (error) {
        console.warn(`[Category Service] MySQL fetch failed (${formatDbError(error)}). Serving fallback categories.`);
    }

    return fallbackCategories;
};
