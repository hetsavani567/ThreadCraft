import { Router } from "express";
import { getProducts, getProductById, createProduct, updateVariant, addVariant, updateProduct, addReview, deleteReview, updateStock } from "../controllers/product.controller.js";

const router = Router();

router.get("/", getProducts);
router.post("/", createProduct);
router.post("/:id/variants", addVariant);
router.post("/variants", addVariant);
router.patch("/:id/stock", updateStock);
router.post("/:id/stock", updateStock);
router.put("/:id/stock", updateStock);
router.put("/variants/:variantId", updateVariant);
router.patch("/variants/:variantId", updateVariant);
router.put("/:id", updateProduct);
router.patch("/:id", updateProduct);
router.get("/:id", getProductById);
router.post("/:id/reviews", addReview);
router.delete("/:id/reviews/:reviewId", deleteReview);
router.delete("/reviews/:reviewId", deleteReview);

export default router;

