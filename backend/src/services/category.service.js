import * as categoryModel from "../models/category.model.js";

export const fetchAllCategories = async () => {
    return await categoryModel.getAllCategories();
};
