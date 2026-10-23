import express from "express";
import cors from "cors";
import productRoutes from "./routes/product.routes.js";
import healthRoutes from "./routes/health.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import brandRoutes from "./routes/brand.routes.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { getRoot } from "./controllers/health.controller.js";

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get(["/", "/api"], getRoot);

// API & Direct Routes
app.use(["/health", "/api/health"], healthRoutes);
app.use(["/products", "/api/products"], productRoutes);
app.use(["/categories", "/api/categories"], categoryRoutes);
app.use(["/brands", "/api/brands"], brandRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
