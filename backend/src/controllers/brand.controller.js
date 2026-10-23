import * as brandService from "../services/brand.service.js";

export const getBrands = async (req, res, next) => {
    try {
        const brands = await brandService.fetchAllBrands();
        res.json(brands);
    } catch (error) {
        console.error("Database error in getBrands:", error);
        res.status(500).json({
            message: "Failed to fetch brands",
            error: error.message
        });
    }
};
