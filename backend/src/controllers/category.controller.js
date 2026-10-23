import * as categoryService from "../services/category.service.js";

export const getCategories = async (req, res, next) => {
    try {
        const categories = await categoryService.fetchAllCategories();
        res.json(categories);
    } catch (error) {
        console.error("Database error in getCategories:", error);
        res.status(500).json({
            message: "Failed to fetch categories",
            error: error.message
        });
    }
};
