import { Router } from "express";
import { getProducts, getProductById, createProduct, updateVariant } from "../controllers/product.controller.js";

const router = Router();

router.get("/", getProducts);
router.post("/", createProduct);
router.put("/variants/:variantId", updateVariant);
router.patch("/variants/:variantId", updateVariant);
router.get("/:id", getProductById);

export default router;

