import dotenv from "dotenv";
import app from "./src/app.js";
import { testConnection } from "./src/db/index.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await testConnection();

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
};

startServer();