import { Router } from "express";
import { lookupCustomer, createCustomer } from "../controllers/customer.controller.js";

const router = Router();

router.get("/", lookupCustomer);
router.get("/lookup", lookupCustomer);
router.post("/", createCustomer);

export default router;
