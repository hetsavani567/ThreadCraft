import * as brandModel from "../models/brand.model.js";
import { formatDbError } from "../db/index.js";
import { fallbackBrands } from "../data/fallbackProducts.js";

export const fetchAllBrands = async () => {
    try {
        const brands = await brandModel.getAllBrands();
        if (Array.isArray(brands) && brands.length > 0) {
            return brands;
        }
    } catch (error) {
        console.warn(`[Brand Service] MySQL fetch failed (${formatDbError(error)}). Serving fallback brands.`);
    }

    return fallbackBrands;
};
