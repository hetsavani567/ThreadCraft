import { Router } from "express";
import { getProducts, getProductById, createProduct, updateVariant, updateProduct, addReview, deleteReview } from "../controllers/product.controller.js";

const router = Router();

router.get("/", getProducts);
router.post("/", createProduct);
router.put("/variants/:variantId", updateVariant);
router.patch("/variants/:variantId", updateVariant);
router.put("/:id", updateProduct);
router.patch("/:id", updateProduct);
router.get("/:id", getProductById);
router.post("/:id/reviews", addReview);
router.delete("/:id/reviews/:reviewId", deleteReview);
router.delete("/reviews/:reviewId", deleteReview);

export default router;

