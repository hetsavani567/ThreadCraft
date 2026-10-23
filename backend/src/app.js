import express from "express";
import cors from "cors";
import productRoutes from "./routes/product.routes.js";
import healthRoutes from "./routes/health.routes.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { getRoot } from "./controllers/health.controller.js";

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get("/", getRoot);

// API & Direct Routes (compatible with both /api/* and direct /* endpoints)
app.use("/api/health", healthRoutes);
app.use("/health", healthRoutes);

app.use("/api/products", productRoutes);
app.use("/products", productRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
