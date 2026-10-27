import { Router } from "express";
import { getProducts, getProductById, createProduct, updateVariant, updateProduct } from "../controllers/product.controller.js";

const router = Router();

router.get("/", getProducts);
router.post("/", createProduct);
router.put("/variants/:variantId", updateVariant);
router.patch("/variants/:variantId", updateVariant);
router.put("/:id", updateProduct);
router.patch("/:id", updateProduct);
router.get("/:id", getProductById);

export default router;

