import * as brandModel from "../models/brand.model.js";

export const fetchAllBrands = async () => {
    return await brandModel.getAllBrands();
};
