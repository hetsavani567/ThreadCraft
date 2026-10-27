import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import healthRoutes from "./routes/health.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import brandRoutes from "./routes/brand.routes.js";
import orderRoutes from "./routes/order.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { getRoot } from "./controllers/health.controller.js";

const app = express();

// Global Middlewares
app.use(cors({
    origin: (origin, callback) => callback(null, true), // Allow all origins with credentials
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Root endpoint
app.get(["/", "/api"], getRoot);

// API & Direct Routes
app.use(["/auth", "/api/auth"], authRoutes);
app.use(["/health", "/api/health"], healthRoutes);
app.use(["/products", "/api/products"], productRoutes);
app.use(["/categories", "/api/categories"], categoryRoutes);
app.use(["/brands", "/api/brands"], brandRoutes);
app.use(["/orders", "/api/orders"], orderRoutes);
app.use(["/customers", "/api/customers"], customerRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
