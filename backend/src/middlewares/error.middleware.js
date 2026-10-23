export const errorHandler = (err, req, res, next) => {
    console.error("Internal Server Error:", err);
    res.status(err.status || 500).json({
        message: err.message || "Failed to fetch products"
    });
};

export const notFoundHandler = (req, res) => {
    res.status(404).json({
        message: `Route not found: ${req.originalUrl}`
    });
};
